import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, type Dirent, type Stats } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import {
  classifyArtifactSource,
  createArtifactSource,
  type ApprovalStatus,
} from "../domain/lifecycle-memory-core.js";
import {
  createDurableSourceObservation,
  type CreateDurableSourceApprovalMetadataInput,
  type DurableSourceObservation,
} from "../domain/local-workspace-storage.js";

export class WorkspaceSourceReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceSourceReadError";
  }
}

export type WorkspaceScanRuleKind = "include" | "exclude" | "non_memory";

export type WorkspaceScanSkipReason =
  | "excluded_by_rule"
  | "unclassified_artifact"
  | "unreadable_file"
  | "empty_artifact"
  | "file_too_large";

/**
 * Declarative matcher so the rule set stays inspectable data rather than logic buried in the
 * directory walk. A rule matches when every field it declares matches.
 */
export interface WorkspacePathMatcher {
  readonly pathPrefix?: string;
  readonly pathSegment?: string;
  readonly fileSuffix?: string;
  /** Exact base name. Preferred over `fileSuffix` for precedence-bearing rules. */
  readonly fileName?: string;
  readonly rootLevelOnly?: boolean;
}

export interface WorkspaceScanRule {
  readonly label: string;
  readonly kind: WorkspaceScanRuleKind;
  readonly match: WorkspacePathMatcher;
  readonly reason: string;
  /**
   * For `non_memory` rules only. When true the rule is honoured before classification is
   * attempted, so a declared non-memory document leaves memory even if a classification rule
   * would match it. Opt-in per rule: a global ordering change would remove far more than any
   * single decision covers.
   */
  readonly overridesClassification?: boolean;
}

export interface WorkspaceScanSkip {
  readonly workspacePath: string;
  readonly reason: WorkspaceScanSkipReason;
  readonly detail: string;
}

export interface WorkspaceScanResult {
  readonly workspaceRoot: string;
  readonly scannedAt: string;
  readonly observations: readonly DurableSourceObservation[];
  readonly skipped: readonly WorkspaceScanSkip[];
  readonly excludedPaths: readonly string[];
  readonly candidateFileCount: number;
  readonly appliedRules: readonly WorkspaceScanRule[];
}

export interface ApprovalExtraction {
  readonly status: ApprovalStatus;
  readonly approver?: string;
  readonly decisionDate?: string;
  readonly evidence?: string;
}

export interface WorkspaceSourceReaderOptions {
  readonly rules?: readonly WorkspaceScanRule[];
  readonly now?: () => string;
  readonly maxFileBytes?: number;
}

export const DEFAULT_MAX_ARTIFACT_BYTES = 1_048_576;

/**
 * Exclusions are evaluated before inclusions. `src/docs/` is excluded because the approved
 * repository content boundary reserves it for product templates and fixtures, which are not
 * project memory.
 */
export const DEFAULT_WORKSPACE_SCAN_RULES: readonly WorkspaceScanRule[] = [
  exclude("exclude:node-modules", { pathPrefix: "node_modules/" }, "Dependency tree is not workspace memory."),
  exclude("exclude:build-output", { pathPrefix: "dist/" }, "Build output is derived, not durable source."),
  exclude("exclude:git", { pathPrefix: ".git/" }, "Version control internals are not workspace memory."),
  exclude("exclude:agent-memory-state", { pathPrefix: ".agent-memory/" }, "Agent-memory's own derived state is not a durable source."),
  exclude("exclude:product-docs", { pathPrefix: "src/docs/" }, "src/docs/ holds product templates and fixtures, not project memory."),
  include("include:lifecycle-docs", { pathPrefix: "docs/", fileSuffix: ".md" }, "Root docs/ holds AI-DLC lifecycle artifacts."),
  include("include:session-logs", { pathPrefix: "session-logs/", fileSuffix: ".md" }, "Session logs are handoff memory."),
  include("include:root-markdown", { fileSuffix: ".md", rootLevelOnly: true }, "Root-level Markdown can carry current project state."),
  nonMemory("non-memory:methodology", { pathPrefix: "docs/00-methodology/" }, "Methodology documents describe the AI-DLC method, not this project's lifecycle state."),
  nonMemory("non-memory:operations", { pathPrefix: "docs/03-operations/" }, "Operations documents are unfilled templates until a deployment gate runs."),
  // Exact base name, not a suffix: a precedence-bearing rule must not sweep in a document
  // such as `docs/api-readme.md` and silently remove real memory.
  nonMemory("non-memory:readme", { fileName: "readme.md" }, "Directory READMEs are navigation, not lifecycle memory.", true),
  nonMemory("non-memory:template", { fileSuffix: "_template.md" }, "Reusable templates carry placeholders, not project decisions.", true),
  nonMemory("non-memory:template-checklist", { fileSuffix: "template_checklist.md" }, "Template checklists track scaffolding, not project state."),
  nonMemory("non-memory:agent-instructions", { fileSuffix: "agents.md" }, "Agent instruction files configure tooling, not project memory."),
  nonMemory("non-memory:reference-paper", { fileSuffix: "ai-dlc-paper.md" }, "Reference material about the method is not project memory."),
];

/**
 * The BOLT-01 classifier matches directory rules with a leading slash, so a root-level folder
 * such as `session-logs/` never matches by path. Declaring the artifact type here lets the
 * approved classifier resolve it through its type rules instead, without changing BOLT-01.
 */
export interface WorkspaceArtifactTypeRule {
  readonly pathSegment: string;
  readonly artifactType: string;
}

export const DEFAULT_ARTIFACT_TYPE_RULES: readonly WorkspaceArtifactTypeRule[] = [
  { pathSegment: "/01-intent-clarification/", artifactType: "intent" },
  { pathSegment: "/02-user-stories/", artifactType: "user-story" },
  { pathSegment: "/03-nfrs/", artifactType: "nfr" },
  { pathSegment: "/04-risks/", artifactType: "risk" },
  { pathSegment: "/05-units/", artifactType: "unit" },
  { pathSegment: "/06-bolts/", artifactType: "bolt" },
  { pathSegment: "/03-domain-design/unit_", artifactType: "domain-design" },
  { pathSegment: "/project_status.md", artifactType: "project-status" },
  { pathSegment: "/session-logs/", artifactType: "session-log" },
  { pathSegment: "/04-code-generation/", artifactType: "verification" },
  { pathSegment: "technology_decisions", artifactType: "decision" },
  { pathSegment: "system_architecture", artifactType: "architecture" },
  { pathSegment: "test_results", artifactType: "verification" },
  { pathSegment: "setup_validation", artifactType: "verification" },
  { pathSegment: "/99-plans/", artifactType: "plan" },
  { pathSegment: "/02-design-plan/", artifactType: "plan" },
  { pathSegment: "_plan.md", artifactType: "plan" },
];

export function listWorkspaceScanRules(): readonly WorkspaceScanRule[] {
  return DEFAULT_WORKSPACE_SCAN_RULES;
}

export function deriveArtifactType(
  workspacePath: string,
  rules: readonly WorkspaceArtifactTypeRule[] = DEFAULT_ARTIFACT_TYPE_RULES,
): string | undefined {
  // Matched against a leading-slash path so root-level and nested directories behave alike.
  const anchored = `/${workspacePath.toLowerCase()}`;
  return rules.find((rule) => anchored.includes(rule.pathSegment.toLowerCase()))?.artifactType;
}

export function isExcludedPath(
  workspacePath: string,
  rules: readonly WorkspaceScanRule[] = DEFAULT_WORKSPACE_SCAN_RULES,
): boolean {
  return rules.some((rule) => rule.kind === "exclude" && matches(rule.match, workspacePath));
}

export function isCandidatePath(
  workspacePath: string,
  rules: readonly WorkspaceScanRule[] = DEFAULT_WORKSPACE_SCAN_RULES,
): boolean {
  if (isExcludedPath(workspacePath, rules)) return false;

  return rules.some((rule) => rule.kind === "include" && matches(rule.match, workspacePath));
}

/**
 * Finds the rule that declares a candidate to be outside project memory. Consulted only after
 * classification fails, so a declared non-memory path that a classification rule does cover
 * stays memory. That keeps this slice from silently removing anything already classified.
 */
export function findNonMemoryRule(
  workspacePath: string,
  rules: readonly WorkspaceScanRule[] = DEFAULT_WORKSPACE_SCAN_RULES,
): WorkspaceScanRule | undefined {
  return rules.find((rule) => rule.kind === "non_memory" && matches(rule.match, workspacePath));
}

/**
 * Finds a non-memory rule that wins over classification. Searched independently of
 * `findNonMemoryRule` so a broader non-overriding rule listed earlier, such as the operations
 * prefix, cannot mask an overriding rule such as the template rule.
 */
export function findOverridingNonMemoryRule(
  workspacePath: string,
  rules: readonly WorkspaceScanRule[] = DEFAULT_WORKSPACE_SCAN_RULES,
): WorkspaceScanRule | undefined {
  return rules.find(
    (rule) =>
      rule.kind === "non_memory" &&
      rule.overridesClassification === true &&
      matches(rule.match, workspacePath),
  );
}

/**
 * Hashes normalized content so the version is identical across platforms and clones. File
 * mtime would not be, and NFR-003 requires rebuild to be reproducible.
 */
export function deriveObservedVersion(content: string): string {
  const digest = createHash("sha256").update(normalizeContent(content), "utf8").digest("hex");
  return `sha256:${digest.slice(0, 16)}`;
}

/**
 * Reads the approval state an AI-DLC artifact declares about itself. Anything unrecognised is
 * `draft`: BOLT-03 ranking adds +50 for approved, so guessing "approved" would let unreviewed
 * text outrank real approved memory.
 */
export function extractApprovalMetadata(content: string): ApprovalExtraction {
  const section = approvalSection(content);
  if (!section) {
    return { status: "draft" };
  }

  // Only the verdict paragraph decides the status. An AI-DLC artifact states its verdict
  // first, and a section can run into body content that merely mentions approval words.
  const verdict = section.split(/\n\s*\n/u).map((block) => block.trim()).find((block) => block.length > 0);
  if (!verdict) {
    return { status: "draft" };
  }

  // Supersession is the one marker read from anywhere in the section. Requiring it in the
  // verdict paragraph made the outcome depend on paragraph placement, which silently left one
  // superseded artifact classified `approved` while its sibling was `historical`. The phrase
  // is specific enough not to collide with body prose.
  if (/\bsuperseded\s+by\b/iu.test(section) && !isPlaceholderVerdict(verdict)) {
    return {
      status: "historical",
      decisionDate: /(\d{4}-\d{2}-\d{2})/u.exec(verdict)?.[1],
      evidence: verdict,
    };
  }

  // An unfilled template placeholder lists every option at once, so it declares nothing.
  if (isPlaceholderVerdict(verdict)) {
    return { status: "draft", evidence: verdict };
  }

  const attribution = /\bby\s+(?:the\s+)?([A-Za-z][\w .-]*?)\s+on\s+(\d{4}-\d{2}-\d{2})/iu.exec(verdict);
  const isoDate = /(\d{4}-\d{2}-\d{2})/u.exec(verdict);

  return {
    status: approvalStatusFrom(verdict),
    approver: attribution ? attribution[1]?.trim() : undefined,
    decisionDate: attribution ? attribution[2] : isoDate?.[1],
    evidence: verdict,
  };
}

export class WorkspaceSourceReader {
  private readonly rules: readonly WorkspaceScanRule[];
  private readonly now: () => string;
  private readonly maxFileBytes: number;

  constructor(options: WorkspaceSourceReaderOptions = {}) {
    this.rules = options.rules ?? DEFAULT_WORKSPACE_SCAN_RULES;
    this.now = options.now ?? (() => new Date().toISOString());
    this.maxFileBytes = options.maxFileBytes ?? DEFAULT_MAX_ARTIFACT_BYTES;
  }

  scan(workspaceRoot: string): WorkspaceScanResult {
    const root = resolveWorkspaceRoot(workspaceRoot);
    const scannedAt = this.now();
    const observations: DurableSourceObservation[] = [];
    const skipped: WorkspaceScanSkip[] = [];
    const excludedPaths: string[] = [];
    const candidates: string[] = [];

    this.walk(root, "", candidates, excludedPaths);

    for (const workspacePath of candidates.sort()) {
      const outcome = this.readCandidate(root, workspacePath, scannedAt);
      if (outcome.observation) {
        observations.push(outcome.observation);
      } else if (outcome.skip) {
        skipped.push(outcome.skip);
      }
    }

    return {
      workspaceRoot: root,
      scannedAt,
      observations,
      skipped,
      excludedPaths: excludedPaths.sort(),
      candidateFileCount: candidates.length,
      appliedRules: this.rules,
    };
  }

  /** Reads one known artifact. Throws instead of skipping, because the caller named this file. */
  readArtifact(workspaceRoot: string, workspacePath: string): DurableSourceObservation {
    const root = resolveWorkspaceRoot(workspaceRoot);
    const normalized = normalizeWorkspacePath(workspacePath);
    const outcome = this.readCandidate(root, normalized, this.now());

    if (!outcome.observation) {
      throw new WorkspaceSourceReadError(
        outcome.skip
          ? `${normalized} could not be read as a durable source: ${outcome.skip.detail}`
          : `${normalized} could not be read as a durable source.`,
      );
    }

    return outcome.observation;
  }

  private walk(
    root: string,
    relativeDir: string,
    candidates: string[],
    excludedPaths: string[],
  ): void {
    const absoluteDir = relativeDir ? join(root, relativeDir) : root;

    let entries: readonly Dirent[];
    try {
      entries = readdirSync(absoluteDir, { withFileTypes: true });
    } catch {
      excludedPaths.push(`${relativeDir || "."}/`);
      return;
    }

    for (const entry of entries) {
      // Symlinks are not followed: a cycle would hang the scan and the target is either
      // already inside the workspace or outside it.
      if (entry.isSymbolicLink()) continue;

      const childPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (isExcludedPath(`${childPath}/`, this.rules)) {
          excludedPaths.push(`${childPath}/`);
          continue;
        }

        this.walk(root, childPath, candidates, excludedPaths);
        continue;
      }

      if (!entry.isFile()) continue;

      if (isExcludedPath(childPath, this.rules)) {
        excludedPaths.push(childPath);
        continue;
      }

      if (isCandidatePath(childPath, this.rules)) {
        candidates.push(childPath);
      }
    }
  }

  private readCandidate(
    root: string,
    workspacePath: string,
    scannedAt: string,
  ): { readonly observation?: DurableSourceObservation; readonly skip?: WorkspaceScanSkip } {
    const absolutePath = join(root, ...workspacePath.split("/"));

    // Checked before the file is opened: a declared non-memory document with precedence never
    // needs its content, its version, or a classification attempt.
    const overridingRule = findOverridingNonMemoryRule(workspacePath, this.rules);
    if (overridingRule) {
      return {
        skip: {
          workspacePath,
          reason: "excluded_by_rule",
          detail: `${overridingRule.label}: ${overridingRule.reason}`,
        },
      };
    }

    let raw: string;
    try {
      const stats: Stats = statSync(absolutePath);
      if (stats.size > this.maxFileBytes) {
        return {
          skip: {
            workspacePath,
            reason: "file_too_large",
            detail: `${stats.size} bytes exceeds the ${this.maxFileBytes}-byte artifact limit.`,
          },
        };
      }

      raw = readFileSync(absolutePath, "utf8");
    } catch (error) {
      return {
        skip: {
          workspacePath,
          reason: "unreadable_file",
          detail: errorMessage(error),
        },
      };
    }

    const content = normalizeContent(raw);
    if (content.trim().length === 0) {
      return {
        skip: { workspacePath, reason: "empty_artifact", detail: "Artifact has no content." },
      };
    }

    const observedVersion = deriveObservedVersion(content);
    const artifactSource = createArtifactSource({
      workspacePath,
      artifactType: deriveArtifactType(workspacePath),
      observedVersion,
      observedAt: scannedAt,
    });

    try {
      // The classifier throws on unmatched paths by design. A real workspace always contains
      // unmatched files, so an unmatched artifact is reported data, not a scan failure.
      classifyArtifactSource(artifactSource);
    } catch (error) {
      const nonMemoryRule = findNonMemoryRule(workspacePath, this.rules);

      return {
        skip: nonMemoryRule
          ? {
              workspacePath,
              reason: "excluded_by_rule",
              detail: `${nonMemoryRule.label}: ${nonMemoryRule.reason}`,
            }
          : {
              workspacePath,
              reason: "unclassified_artifact",
              detail: errorMessage(error),
            },
      };
    }

    // US-002 AC-004: a template's declared approval is never project approval, whatever its
    // placeholder text happens to say.
    const approval = artifactSource.isTemplate
      ? { status: "draft" as ApprovalStatus }
      : extractApprovalMetadata(content);

    return {
      observation: createDurableSourceObservation({
        workspacePath,
        sourceKind: "lifecycle_artifact",
        artifactType: artifactSource.artifactType,
        observedVersion,
        observedAt: scannedAt,
        content,
        isTemplate: artifactSource.isTemplate,
        approval: approvalMetadataInput(approval),
      }),
    };
  }
}

function approvalMetadataInput(
  extraction: ApprovalExtraction,
): CreateDurableSourceApprovalMetadataInput {
  return {
    status: extraction.status,
    approver: extraction.approver,
    decisionDate: extraction.decisionDate,
  };
}

function approvalSection(content: string): string | undefined {
  const heading = /^#{2,3}\s+Approval\s+Status\s*$/imu.exec(content);
  if (!heading || heading.index === undefined) return undefined;

  const rest = content.slice(heading.index + heading[0].length);
  const nextHeading = /^#{1,6}\s+/mu.exec(rest);
  const section = nextHeading?.index === undefined ? rest : rest.slice(0, nextHeading.index);

  return section.trim().length > 0 ? section : undefined;
}

function isPlaceholderVerdict(verdict: string): boolean {
  return /<[^>\n]{2,}>/u.test(verdict);
}

function approvalStatusFrom(verdict: string): ApprovalStatus {
  // Ordered so a verdict that both requests changes and mentions approval resolves to the
  // more restrictive state.
  if (/\bchanges?\s+requested\b/iu.test(verdict)) return "changes_requested";
  if (/\bpending\b|\bawaiting\b|\bnot\s+yet\s+approved\b/iu.test(verdict)) return "pending_review";
  if (/\bsuperseded\b|\bhistorical\b|\bobsolete\b/iu.test(verdict)) return "historical";
  if (/\bdeferred\b/iu.test(verdict)) return "deferred";
  if (/\bapproved\b/iu.test(verdict)) return "approved";

  return "draft";
}

function matches(matcher: WorkspacePathMatcher, workspacePath: string): boolean {
  const path = workspacePath.toLowerCase();
  let declared = false;

  if (matcher.pathPrefix !== undefined) {
    declared = true;
    if (!path.startsWith(matcher.pathPrefix.toLowerCase())) return false;
  }

  if (matcher.pathSegment !== undefined) {
    declared = true;
    if (!path.includes(matcher.pathSegment.toLowerCase())) return false;
  }

  if (matcher.fileSuffix !== undefined) {
    declared = true;
    if (!path.endsWith(matcher.fileSuffix.toLowerCase())) return false;
  }

  if (matcher.fileName !== undefined) {
    declared = true;
    if (path.split("/").pop() !== matcher.fileName.toLowerCase()) return false;
  }

  if (matcher.rootLevelOnly === true) {
    declared = true;
    if (path.includes("/")) return false;
  }

  return declared;
}

function include(label: string, match: WorkspacePathMatcher, reason: string): WorkspaceScanRule {
  return { label, kind: "include", match, reason };
}

function nonMemory(
  label: string,
  match: WorkspacePathMatcher,
  reason: string,
  overridesClassification = false,
): WorkspaceScanRule {
  return { label, kind: "non_memory", match, reason, overridesClassification };
}

function exclude(label: string, match: WorkspacePathMatcher, reason: string): WorkspaceScanRule {
  return { label, kind: "exclude", match, reason };
}

function resolveWorkspaceRoot(workspaceRoot: string): string {
  if (typeof workspaceRoot !== "string" || workspaceRoot.trim().length === 0) {
    throw new WorkspaceSourceReadError("Workspace root is required.");
  }

  const root = resolve(workspaceRoot.trim());
  let stats: Stats;
  try {
    stats = statSync(root);
  } catch (error) {
    throw new WorkspaceSourceReadError(`Workspace root is not readable: ${errorMessage(error)}`);
  }

  if (!stats.isDirectory()) {
    throw new WorkspaceSourceReadError(`Workspace root is not a directory: ${root}`);
  }

  return root;
}

function normalizeWorkspacePath(workspacePath: string): string {
  return workspacePath.trim().split(sep).join("/").replaceAll("\\", "/").replace(/^\.\//u, "");
}

/** CRLF is normalized before hashing and storing so the version is stable across platforms. */
function normalizeContent(content: string): string {
  return content.replaceAll("\r\n", "\n").replace(/^﻿/u, "");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function toWorkspaceRelativePath(workspaceRoot: string, absolutePath: string): string {
  return normalizeWorkspacePath(relative(resolve(workspaceRoot), resolve(absolutePath)));
}
