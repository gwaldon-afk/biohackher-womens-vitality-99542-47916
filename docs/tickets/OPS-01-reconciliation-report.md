# OPS-01 — Repo Reconciliation Report

Priority: Ops
Status: Open

Goal:
Capture proof that Desktop Cursor, GitHub, and deployed branch are aligned.

Commands:
- git remote -v
- git status -sb
- git rev-parse HEAD
- git rev-parse origin/staging
- git diff --name-status origin/staging...HEAD

Acceptance Criteria:
- Report saved to this file
- Confirms alignment or highlights drift
