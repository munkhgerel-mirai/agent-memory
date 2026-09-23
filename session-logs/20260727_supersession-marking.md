# Session Log - Supersession Marking For Superseded Reports

**Date:** 2026-07-27
**Duration:** Short corrective action following the BOLT-10 context-packing analysis

## Skills Used

- 2026-07-27: `ai-dlc-code-generation` - applied the "T1" supersession marking discussed during the context-packing options review.

## Summary

- Measured the approval classification of the BOLT-08a and BOLT-08b review artifacts and found them inconsistent by accident.
- Rewrote the approval verdict paragraph of `code_generation_report_bolt08a.md` so it declares supersession, making its `historical` classification deliberate.
- Verified the blast radius, the ranking effect, and the full test suite.
- Updated `PROJECT_STATUS.md`.

## What Prompted It

While analysing why `agent-memory context` returns one artifact, the corpus turned out to contain contradictory approved facts. `code_generation_report_bolt08a.md` states 115 observations and 41 exclusions; `code_generation_report_bolt08b.md` states 95 and 66. Both were classified `approved`, so nothing in the data said which was current. Raising the token budget would make that contradiction more visible, not less.

## Finding Before The Change

The BOLT-08 approval extractor reads only the first verdict paragraph of the `## Approval Status` section and treats `superseded`, `historical`, or `obsolete` as `historical`, checked before `approved`.

Measured against the two BOLT-08a artifacts:

| Artifact | Classification | Why |
|----------|----------------|-----|
| `test_results_bolt08a.md` | `historical` | The word "superseded" happened to sit in the verdict paragraph |
| `code_generation_report_bolt08a.md` | `approved` | The same word sat in the *second* paragraph, so it was never read |

Two sibling artifacts describing the same superseded state were classified differently, purely by paragraph placement. The mechanism existed and worked; it was simply not being used on purpose.

## Change Applied

Rewrote the approval verdict of `code_generation_report_bolt08a.md` to declare supersession in the first paragraph, while keeping the record honest: the implementation it describes still stands, only its coverage measurements were superseded. The tables were left unedited, per NFR-004. A short retrieval note explains why the wording matters, so a future editor does not "tidy" it away.

No source code was changed.

## Verification

- Blast radius: a full scan reports exactly two `historical` artifacts, the intended pair. Distribution is 40 approved, 64 draft, 2 historical, 2 pending_review.
- Ranking effect on a "classification coverage" query:

| Artifact | Rank | Score | Status |
|----------|------|-------|--------|
| `code_generation_report_bolt08b.md` | 3 | 168 | approved |
| `test_results_bolt08b.md` | 5 | 168 | approved |
| `code_generation_report_bolt08a.md` | 46 | 115 | historical |
| `test_results_bolt08a.md` | 47 | 115 | historical |

A 53-point, 43-position demotion on precisely the query where the stale numbers would have been misleading.

- `npm test` - Pass: 96 tests, 0 failures. No test asserted the previous classification, so nothing needed updating.

## Convention Captured In The Templates

Applied immediately after the marking, because an undocumented convention would have drifted.

- `test_results_TEMPLATE.md`: extended the approval placeholder with the superseded form and added a short retrieval note explaining why the verdict paragraph matters.
- `code_generation_report_TEMPLATE.md`: **added the `## Approval Status` section, which was missing entirely.** Every real report has one, so the template had drifted from practice and gave an author no prompt at all.

Verified afterwards: both templates are still caught by `non-memory:template` with precedence, so neither enters memory; classification coverage remains 0 unclassified; and the full suite passes at 96 tests.

Templates were the right place because they are what an author actually opens. `docs/00-methodology/` was considered and rejected as the primary home, since that whole directory is declared non-memory and an agent would never retrieve the convention from there.

## Limits Of This Change

- BOLT-03 gives `approved` +50 and `historical` 0, so supersession demotes by omission rather than by explicit penalty. A `historical` penalty would be a one-line improvement.
- Supersession remains prose in a sentence, not a typed lifecycle edge. Nothing links the superseded artifact to its replacement as data. US-003 covers this and is unimplemented.
- The convention still depends on the word landing in the verdict paragraph. The extractor reads only that paragraph, which is exactly the trap that produced the original inconsistency. Widening it to accept "superseded by" anywhere in the `## Approval Status` section would remove the trap; the phrase occurs exactly twice in the repository, both intentional, so the change is safe. That is a BOLT-08 code change and needs its own approved slice.

## Next Steps

1. Fold into the context-packing slice: widen the approval extractor to accept "superseded by" anywhere in the `## Approval Status` section, so the convention no longer depends on paragraph placement.
2. Consider an explicit `historical` ranking penalty in BOLT-03.
3. Consider implementing `supersedes` lifecycle edges under US-003, which is the structural fix.
4. Continue with the context-packing decision, which remains the blocker on US-001.
