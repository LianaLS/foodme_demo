# Accessibility Checklist (WCAG 2.1 A/AA)

**ISTQB:** CTFL 4.4.3 (checklist-based), 2.2.2 (non-functional testing — usability / accessibility, ISO/IEC 25010).
Automated part: `apps/web/e2e/a11y.spec.ts` (axe-core). Automated tools find
only part of the issues — the manual checks below are still needed.

Page: ____________ · Build/commit: ____________ · Tester: ____________ · Date: ____________

| # | Check | WCAG | Yes / No / N/A | Notes |
|---|---|---|---|---|
| A11Y-01 | axe-core scan has no critical or serious violations | — | | |
| A11Y-02 | Every page can be used with the keyboard only (Tab, Shift+Tab, Enter, Space, Esc) | 2.1.1 | | |
| A11Y-03 | Focus is always visible | 2.4.7 | | |
| A11Y-04 | Dialogs (dish modal, "Switch kitchens?") trap focus and close with Esc | 2.1.2 | | |
| A11Y-05 | Every form field has a programmatic label | 1.3.1, 4.1.2 | | |
| A11Y-06 | Error messages are linked to fields (`aria-describedby`) and announced | 3.3.1 | | |
| A11Y-07 | Text contrast ≥ 4.5:1 (large text ≥ 3:1) | 1.4.3 | | |
| A11Y-08 | Images have meaningful `alt` text, decorative images have `alt=""` | 1.1.1 | | |
| A11Y-09 | Page has one `h1` and a logical heading order | 1.3.1 | | |
| A11Y-10 | Page is usable at 200% zoom and 320 px width without horizontal scroll | 1.4.4, 1.4.10 | | |
| A11Y-11 | `<html lang>` is set | 3.1.1 | | |
