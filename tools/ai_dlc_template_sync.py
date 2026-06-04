"""AI-DLC template sync policy checks.

This wrapper keeps Copier as the update engine while enforcing AI-DLC ownership
rules around project-owned and manual-merge files.
"""

from __future__ import annotations

import argparse
import enum
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


class Ownership(str, enum.Enum):
    TEMPLATE = "template-owned"
    PROJECT = "project-owned"
    MANUAL = "manual-merge"
    UNKNOWN = "unknown"


PROJECT_OWNED_EXACT = {
    ".gitignore",
    "PROJECT_STATUS.md",
    "README.md",
}

PROJECT_OWNED_PREFIXES = (
    "session-logs/",
    "src/",
    "src/tests/",
)

TEMPLATE_OWNED_EXACT = {
    ".ai-dlc-template.yml",
    ".ai-dlc-template.yml.jinja",
    ".copier-answers.yml",
    ".gitignore.jinja",
    "{{ _copier_conf.answers_file }}.jinja",
    "TEMPLATE_CHECKLIST.md",
    "ai-dlc-paper.md",
    "copier.yml",
    "session-logs/README.md",
    "tools/ai_dlc_template_sync.py",
}

MANUAL_MERGE_EXACT = {
    "AGENTS.md",
}

RECOMMENDED_GITIGNORE_ENTRIES = (
    ".omx/state/",
    ".omx/logs/",
    ".omx/tmp/",
    "__pycache__/",
    "*.py[cod]",
    ".pytest_cache/",
    ".ruff_cache/",
    ".mypy_cache/",
    ".env",
    ".env.*",
    "!.env.example",
    ".DS_Store",
    "Thumbs.db",
)

COPIER_ANSWERS_FILE = ".copier-answers.yml"
NEWLY_ADOPTING_COPY_COMMAND = (
    "copier copy --vcs-ref v0.2.1 https://github.com/miraitechnologies/ai_dlc_template.git ."
)


@dataclass(frozen=True)
class ClassifiedPath:
    path: str
    ownership: Ownership


@dataclass(frozen=True)
class PolicyReport:
    changed: tuple[ClassifiedPath, ...]

    @property
    def project_owned(self) -> tuple[ClassifiedPath, ...]:
        return tuple(item for item in self.changed if item.ownership == Ownership.PROJECT)

    @property
    def manual_merge(self) -> tuple[ClassifiedPath, ...]:
        return tuple(item for item in self.changed if item.ownership == Ownership.MANUAL)

    @property
    def unknown(self) -> tuple[ClassifiedPath, ...]:
        return tuple(item for item in self.changed if item.ownership == Ownership.UNKNOWN)

    def render(self) -> str:
        if not self.changed:
            return "No changed files found."

        lines = ["AI-DLC template sync policy report", ""]
        for ownership in Ownership:
            entries = [item.path for item in self.changed if item.ownership == ownership]
            if entries:
                lines.append(f"{ownership.value}:")
                lines.extend(f"- {entry}" for entry in entries)
                lines.append("")
        if self.project_owned:
            lines.append("ERROR: project-owned files changed. Revert these changes or get explicit human approval.")
        if self.manual_merge:
            lines.append("NOTE: manual-merge files changed. Review and merge intentionally.")
        if self.unknown:
            lines.append("NOTE: unknown files changed. Classify them before completing the upgrade.")
        return "\n".join(lines).rstrip()


def normalize_path(path: str | Path) -> str:
    normalized = str(path).replace("\\", "/").strip()
    while normalized.startswith("./"):
        normalized = normalized[2:]
    return normalized.strip("/")


def classify_path(path: str | Path) -> Ownership:
    normalized = normalize_path(path)

    if normalized in MANUAL_MERGE_EXACT:
        return Ownership.MANUAL
    if normalized in TEMPLATE_OWNED_EXACT:
        return Ownership.TEMPLATE
    if normalized in PROJECT_OWNED_EXACT:
        return Ownership.PROJECT
    if normalized.startswith(PROJECT_OWNED_PREFIXES):
        return Ownership.PROJECT
    if normalized.startswith("docs/00-methodology/"):
        return Ownership.TEMPLATE
    if normalized.startswith("docs/") and normalized.endswith("_TEMPLATE.md"):
        return Ownership.TEMPLATE
    if normalized.startswith("docs/"):
        return Ownership.PROJECT
    return Ownership.UNKNOWN


def classify_paths(paths: Iterable[str | Path]) -> tuple[ClassifiedPath, ...]:
    unique_paths = sorted({normalize_path(path) for path in paths if normalize_path(path)})
    return tuple(ClassifiedPath(path, classify_path(path)) for path in unique_paths)


def run_command(command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, cwd=cwd, text=True, capture_output=True, check=False)


def copier_answers_src_path(answers_text: str) -> str | None:
    for line in answers_text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        match = re.match(r"^_src_path\s*:\s*(.*)$", stripped)
        if not match:
            continue
        value = match.group(1).split(" #", 1)[0].strip().strip("'\"")
        if value and value.lower() not in {"null", "~"}:
            return value
    return None


def validate_copier_update_preflight(project_root: Path) -> None:
    answers_file = project_root / COPIER_ANSWERS_FILE
    if not answers_file.exists():
        raise RuntimeError(
            "\n".join(
                [
                    "This is not a Copier-managed Template-Adopted Project yet.",
                    f"Missing required {COPIER_ANSWERS_FILE} with Copier's _src_path metadata.",
                    "Do not run update from the ai_dlc_template source repository.",
                    f"For a Newly Adopting Project, run: {NEWLY_ADOPTING_COPY_COMMAND}",
                ]
            )
        )

    src_path = copier_answers_src_path(answers_file.read_text(encoding="utf-8"))
    if not src_path:
        raise RuntimeError(
            "\n".join(
                [
                    f"{COPIER_ANSWERS_FILE} exists but does not contain a valid _src_path.",
                    "Repair the Copier answers metadata or re-adopt the template before running update.",
                    f"Expected _src_path to point to the AI-DLC template repository, for example: {NEWLY_ADOPTING_COPY_COMMAND}",
                ]
            )
        )


def git_lines(args: list[str], cwd: Path) -> tuple[str, ...]:
    completed = run_command(["git", *args], cwd)
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip())
    return tuple(line.strip() for line in completed.stdout.splitlines() if line.strip())


def changed_files(cwd: Path, base_ref: str | None) -> tuple[str, ...]:
    paths: set[str] = set()
    if base_ref:
        paths.update(git_lines(["diff", "--name-only", base_ref, "--"], cwd))
    else:
        paths.update(git_lines(["diff", "--name-only", "--"], cwd))
        paths.update(git_lines(["diff", "--name-only", "--cached", "--"], cwd))
    paths.update(git_lines(["ls-files", "--others", "--exclude-standard"], cwd))
    return tuple(sorted(paths))


def build_policy_report(paths: Iterable[str | Path]) -> PolicyReport:
    return PolicyReport(classify_paths(paths))


def missing_gitignore_entries(existing_text: str) -> tuple[str, ...]:
    existing_entries = {
        line.strip()
        for line in existing_text.splitlines()
        if line.strip() and not line.strip().startswith("#")
    }
    return tuple(entry for entry in RECOMMENDED_GITIGNORE_ENTRIES if entry not in existing_entries)


def render_gitignore_report(project_root: Path) -> str:
    gitignore = project_root / ".gitignore"
    lines = ["AI-DLC .gitignore recommendation report", ""]

    if not gitignore.exists():
        lines.append("No root .gitignore exists.")
        lines.append("A starter .gitignore may be created only as an approved setup action.")
        lines.append("")
        lines.append("Recommended starter entries:")
        lines.extend(f"- {entry}" for entry in RECOMMENDED_GITIGNORE_ENTRIES)
        return "\n".join(lines)

    missing = missing_gitignore_entries(gitignore.read_text(encoding="utf-8"))
    if not missing:
        lines.append("No missing recommended entries found.")
        return "\n".join(lines)

    lines.append("Recommended additions. Do not apply automatically:")
    lines.extend(f"- {entry}" for entry in missing)
    return "\n".join(lines)


def write_gitignore_report(project_root: Path, output: Path) -> Path:
    output_path = output if output.is_absolute() else project_root / output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(render_gitignore_report(project_root) + "\n", encoding="utf-8")
    return output_path


def run_copier_update(args: argparse.Namespace, project_root: Path) -> int:
    if args.skip_copier:
        return 0
    validate_copier_update_preflight(project_root)
    command = [args.copier_bin, "update", "--defaults"]
    if args.vcs_ref:
        command.extend(["--vcs-ref", args.vcs_ref])
    try:
        completed = run_command(command, project_root)
    except FileNotFoundError as exc:
        raise RuntimeError(
            f"Copier executable not found: {args.copier_bin}. "
            "Install Copier or pass --copier-bin <path-to-copier.exe>."
        ) from exc
    if completed.stdout:
        print(completed.stdout, end="")
    if completed.stderr:
        print(completed.stderr, end="", file=sys.stderr)
    if completed.returncode != 0 and "Template not found" in f"{completed.stdout}\n{completed.stderr}":
        print(
            "Copier could not resolve the template source. Check .copier-answers.yml _src_path, "
            "network access, and whether the requested --vcs-ref exists.",
            file=sys.stderr,
        )
    return completed.returncode


def command_classify(args: argparse.Namespace) -> int:
    for item in classify_paths(args.paths):
        print(f"{item.path}: {item.ownership.value}")
    return 0


def command_check_policy(args: argparse.Namespace) -> int:
    project_root = Path(args.project_root).resolve()
    report = build_policy_report(changed_files(project_root, args.base_ref))
    print(report.render())
    return 2 if report.project_owned else 0


def command_gitignore_report(args: argparse.Namespace) -> int:
    project_root = Path(args.project_root).resolve()
    report_path = write_gitignore_report(project_root, Path(args.output))
    print(f"Wrote {report_path}")
    return 0


def command_update(args: argparse.Namespace) -> int:
    project_root = Path(args.project_root).resolve()
    copier_status = run_copier_update(args, project_root)
    if copier_status != 0:
        return copier_status

    write_gitignore_report(project_root, Path(args.gitignore_report))
    report = build_policy_report(changed_files(project_root, args.base_ref))
    print(report.render())
    return 2 if report.project_owned else 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="AI-DLC template sync policy wrapper.")
    parser.add_argument("--project-root", default=".", help="Project root to inspect.")

    subparsers = parser.add_subparsers(dest="command", required=True)

    classify = subparsers.add_parser("classify", help="Classify one or more paths.")
    classify.add_argument("paths", nargs="+")
    classify.set_defaults(func=command_classify)

    check_policy = subparsers.add_parser("check-policy", help="Check changed files against ownership policy.")
    check_policy.add_argument("--base-ref", default=None, help="Optional git ref to diff against.")
    check_policy.set_defaults(func=command_check_policy)

    gitignore_report = subparsers.add_parser("gitignore-report", help="Write .gitignore recommendation report.")
    gitignore_report.add_argument(
        "--output",
        default="docs/00-methodology/gitignore_recommendations_report.md",
        help="Report output path.",
    )
    gitignore_report.set_defaults(func=command_gitignore_report)

    update = subparsers.add_parser("update", help="Run Copier update, then enforce AI-DLC policy.")
    update.add_argument("--base-ref", default=None, help="Optional git ref to diff against after update.")
    update.add_argument("--copier-bin", default="copier", help="Copier executable name or path.")
    update.add_argument("--vcs-ref", default=None, help="Template version/ref to apply.")
    update.add_argument("--skip-copier", action="store_true", help="Skip Copier and run policy checks only.")
    update.add_argument(
        "--gitignore-report",
        default="docs/00-methodology/gitignore_recommendations_report.md",
        help="Report output path.",
    )
    update.set_defaults(func=command_update)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
