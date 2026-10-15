# QA Checklist — Defence Credit Copilot Prototype

Execute before demo (TASK-18). Check each box; record waivers at the bottom.

## 1. Navigation & shell
- [ ] Every menu item routes without console errors for all 6 personas
- [ ] Hamburger collapses sidebar (desktop) / slides in (mobile ≤860px); state persists across routes
- [ ] Bell badge = unread count; item click marks read + deep-links; "Mark all read" works
- [ ] Avatar dropdown: persona name/role/org correct; Profile & Preferences land on Settings; Help modal opens; Logout returns to the correct login page (MSME vs SIDBI)

## 2. Persona gating
- [ ] MSME menu hides SIDBI items and vice versa
- [ ] `Propose decision` visible only to Anjali; `Record decision` only to Meera; Admin only to Rajesh; programme manager is read-only on cases
- [ ] Direct hash to a disallowed route (e.g. MSME → `#/queue`) shows the role empty-state
- [ ] New onboarding-created account logs in and lands on a working dashboard

## 3. Data coherence
- [ ] Case state consistent across dashboard / queue / tracking for CASE-DEMO-001..003
- [ ] RFI round trip: Anjali raises → Precision notified → responds → Anjali closes
- [ ] Decision round trip: propose → record → MSME notified → tracking decision panel → monitoring enrol CTA
- [ ] Money shows ₹ with Indian grouping; dates DD MMM YYYY

## 4. Domain rules
- [ ] Trading answer → E1 exit; no account; E1 count increments on outcome dashboard
- [ ] Seeker funding view: equity first; debt only under "Future options (locked)"
- [ ] `secret-*.pdf` upload → quarantined, generic message, audit entry
- [ ] Dossier approve disabled until all artefacts confirmed; consent modal precedes send; revoked consent blocks send
- [ ] No "guaranteed approval" wording anywhere

## 5. Accessibility & responsiveness
- [ ] Questionnaire operable by keyboard; visible focus outline
- [ ] 360px / 768px / 1440px pass on: landing, onboarding, dashboard, case review, outcomes
- [ ] Audio buttons present on question screens (simulated playback toast)

## Waivers

| Item | Reason |
|---|---|
