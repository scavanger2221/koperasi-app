# Redesign Plan: Older-User-First UX

> This document records the active redesign philosophy for the Koperasi Simpan Pinjam PWA. The previous "vibrant & playful" direction was rejected in favor of a **calm, spacious, and highly readable** interface for older, non-tech-savvy staff.

---

## Philosophy

**Rejected:** Neon colors, hard shadows, dense horizontal rows, and playful aesthetics.  
**Adopted:** High contrast, generous whitespace, large touch targets, clear typography, and straightforward vertical layouts.

Core principle: *A confused user is a support ticket. Clarity prevents errors.*

---

## What We Changed

### 1. Dashboard (`index.tsx`)
- **Metric cards** now use colored background tints (green for savings, red for loans, yellow for attention) with large (`28px`) bold numbers and icons.
- **Metric cards are full-width on mobile** to prevent currency overflow.
- **Removed the "Aksi Cepat" panel.** The bottom nav and sidebar already provide navigation; the dashboard should show data, not act as a second menu.
- **Chart empty state:** If there is no 6-month trend data, the chart area displays a friendly message instead of a confusing flat line.
- **Alert banner redesign:** The overdue warning uses a white card with a yellow left border and a simple text link. No more full-yellow "pop-up ad" look.

### 2. Desktop Sidebar
- Links are now **minimum 48px tall**.
- Active state is more obvious (bold text + green background).
- Footer was simplified from a boxed card (looked clickable) to small, faint gray text.

### 3. Mobile Card Lists (`angsuran.tsx` as reference)
**Problem:** The old `MobileRow` squeezed member name, status badge, and a "Bayar" button onto one horizontal row, causing truncation and visual clutter.

**Solution:** Custom vertical cards:
- **Name and installment** at the top left, status badge top right.
- **Details** (due date, total, penalty, paid amount) listed in rows below.
- **Action button** (`Bayar Angsuran`) is full-width at the bottom of the card.
- **No truncation** on names — they wrap naturally.

This pattern should be followed for any future complex mobile lists.

### 4. Forms & Filters
- **Date pickers on mobile** are stacked vertically (`grid-cols-1`) instead of side-by-side, preventing overflow.
- Global CSS added for `input[type="date"]` to stop native width overflow.
- Modals remain bottom-sheet on mobile and centered dialogs on desktop.

### 5. Buttons & Actions
- Replaced ambiguous icon-only buttons (e.g. `CheckCircle` for "Pay") with **clear text buttons** (`Bayar`, `Cairkan`).
- All primary action buttons are full-width on mobile cards.

---

## Design Rules Going Forward

### Mobile
1. **Cards must be full-width and vertically stacked.** Never put a badge + button next to a name in a single row.
2. **Currency values must never truncate.** If a card is too narrow, make it `grid-cols-1`.
3. **One primary action per card**, placed at the bottom.
4. **Use plain Indonesian.** "Bayar Angsuran" is better than a cryptic icon.

### Desktop
1. Keep the sidebar + data table pattern.
2. Use color semantically: green = good/savings, red = debt/danger, yellow = warning.
3. Empty charts always show a helpful message, never a flat line.

### Color
- **Green `#16a34a`** — savings, success, primary actions
- **Red `#dc2626`** — loans, danger, deletes, critical alerts
- **Yellow `#facc15`** — warnings, late fees, attention flags
- **White / light grays** — backgrounds, cards

---

## Files of Reference

- `src/routes/index.tsx` — dashboard with metric cards, chart empty state, and alert banner
- `src/routes/angsuran.tsx` — mobile vertical card list (the current best practice)
- `src/components/ui/MetricCard.tsx` — colored, iconified stat card
- `src/components/layout/DesktopSidebar.tsx` — accessible sidebar layout
- `src/styles.css` — global variables, input fixes, and utility classes
