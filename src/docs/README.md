# Agent-memory Runtime Documentation Assets

This folder is for Agent-memory product/runtime documentation assets that ship with or are used by the implementation.

Store these kinds of files here:

- Agent-memory runtime templates
- Classified Markdown examples
- Example memory documents
- Test fixtures for Markdown classification
- Sample context-pack inputs and outputs

Do not store AI-DLC lifecycle artifacts for developing this repository here. Those belong under the repository root `docs/` folder.

Repository boundary:

- `docs/` is reserved for AI-DLC artifacts about developing Agent-memory.
- `src/docs/` is reserved for Agent-memory product assets, templates, classified Markdown examples, and fixtures.

Agent-memory may still read AI-DLC artifacts from a target workspace's `docs/` folder when indexing that workspace. This convention only separates product assets from this repository's own development lifecycle artifacts.
