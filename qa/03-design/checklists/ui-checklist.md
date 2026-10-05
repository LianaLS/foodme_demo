# UI Checklist (storefront and back office)

**ISTQB:** CTFL 4.4.3 — checklist-based testing. Each item is a question
phrased so that "No" means a possible defect. Use it on every new or changed
page. Update the list when a defect slips through (checklists wear out too —
pesticide paradox).

Page: ____________ · Build/commit: ____________ · Tester: ____________ · Date: ____________

| # | Check | Yes / No / N/A | Notes |
|---|---|---|---|
| **Content** | | | |
| UI-01 | Page title and main heading match the page purpose | | |
| UI-02 | No placeholder, "lorem ipsum", `undefined`, `null` or `NaN` text | | |
| UI-03 | Prices use the same format everywhere (`1,500 AMD`) | | |
| UI-04 | Images load; broken images show a fallback | | |
| **Forms** | | | |
| UI-05 | Every input has a visible label | | |
| UI-06 | Required fields are marked or explained | | |
| UI-07 | Every validation rule shows a clear message next to the field | | |
| UI-08 | Values with leading/trailing spaces are handled | | |
| UI-09 | Submit button is disabled or shows progress while the request runs | | |
| UI-10 | Server errors are shown to the user in plain language | | |
| **States** | | | |
| UI-11 | Loading state is shown (the API adds 200–1500 ms latency) | | |
| UI-12 | Empty state has a message and a next step (e.g. "Browse chefs") | | |
| UI-13 | Error state offers recovery (Retry, back link) | | |
| **Navigation** | | | |
| UI-14 | Browser Back/Forward work and do not repeat actions | | |
| UI-15 | Direct URL opens the page (deep link), unknown URLs redirect to `/` | | |
| UI-16 | Reload keeps the state that should persist (cart, sign-in) | | |
| **Layout** | | | |
| UI-17 | No horizontal scroll at 375 px, 768 px, 1440 px | | |
| UI-18 | Text does not overlap or get cut off | | |
| UI-19 | Touch targets are at least 24 × 24 px | | |
| **Console** | | | |
| UI-20 | No errors in the browser console (except the intentional flaky heartbeat) | | |
