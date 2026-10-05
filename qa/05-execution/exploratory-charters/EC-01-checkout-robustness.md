# EC-01 — Checkout robustness

**Charter:** Explore **checkout** with **slow network, double clicks and browser navigation** to discover **duplicate, lost or wrong orders**.

| Field | Value |
|---|---|
| Time box | 45 min |
| Priority | High (RSK-03 = 6, RSK-01 = 9) |
| Requirements | REQ-08, REQ-09, REQ-10 |
| Techniques | Error guessing (EG-01, EG-02, EG-03, EG-04), tours |

## Ideas to start with (not a script)

- DevTools → Network → **Slow 3G**; click **Place order** twice quickly. How many orders appear in `/orders` and in the back office?
- After **Order placed!** press **Back**. Is the cart empty? Can the same order be sent again?
- Sign out in another tab while the checkout form is open, then place the order.
- Change the cart in a second tab while checkout is open in the first tab. Which items end up in the order?
- Switch Delivery ↔ Takeaway several times; do the totals and delivery fee follow? (DT-1)
- Note with 300 / 301 characters, emoji, Armenian and Russian text, HTML.
- Offline mode (DevTools) during **Place order** — is the error message helpful? Is the cart kept?
- Build a cart with subtotal exactly 5000 AMD (free-delivery threshold, TC-19).

## Session results

Write the session sheet in `qa/05-execution/sessions/` using the [template](session-sheet-template.md).
