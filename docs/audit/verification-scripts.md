# Verification Scripts

These scripts are manual step-by-step checks for the longitudinal workflow. Use a test user with multiple assessments completed.

## A) One Assessment (Single Assessment Analysis + Protocol)

1) Log in as a test user.
2) Complete one assessment (e.g., Symptom assessment).
3) Navigate to the assessment results page (e.g., `/assessment-results/<symptom>`).
4) Confirm analysis content is shown for that assessment only.
5) Accept protocol recommendations and add to protocol.
6) Open My Protocols and confirm items were created.
7) Verify protocols show as active and items appear in Today plan (if included).

## B) Two Assessments (Independent Analyses)

1) Complete Assessment A (e.g., LIS).
2) Complete Assessment B (e.g., Hormone Compass).
3) Visit each results page separately:
   - `/lis-results`
   - `/hormone-compass/results`
4) Confirm each page shows assessment-specific analysis.
5) Accept protocol recommendations on both pages.
6) Verify duplicate items are not inserted (watch for duplicate warnings).

## C) Micro + Full Assessment

1) Complete a symptom assessment (micro).
2) Complete a full assessment (e.g., Nutrition).
3) Open Assessment History in Profile.
4) Confirm both records appear (with distinct types).
5) Open each result page to verify analysis content is specific to that assessment.

## D) Protocol Deduplication

1) Generate a protocol from Assessment A.
2) Generate a protocol from Assessment B with overlapping items (same name + type).
3) Accept all items on B.
4) Confirm duplicates are not inserted (check for “duplicate” messaging or missing duplicates).
5) Verify protocol items list does not contain repeated duplicates.

## E) Plan Selection (Include/Exclude Protocol Items)

1) Open My Protocols / Master Protocol Sheet.
2) Toggle “include in plan” off for a specific item.
3) Go to Today Plan and confirm that item is no longer shown.
4) Toggle it on again and confirm it returns.

## F) Export Scenario

1) Go to Settings → Account.
2) Click “Export Data”.
3) Confirm that there is no download/export functionality (current behavior).
4) Record the absence of export in the audit.

