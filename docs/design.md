# Maktabah — Design Guide

This file is read by Claude Code at the start of every frontend session.
**Do not start any redesign session without reading this file first.**
Apply the color palette, typography, and component rules consistently across every page.

---

## How to Work With This File (Instructions for Claude Code)

1. **Read this entire file before writing a single line of code.**
2. For each page, identify which components from the "Component Library" section below are needed.
3. Apply the Maktabah color palette and typography — never use the reference site's colors (orange, teal). Those are for layout/structure inspiration only.
4. After completing each page, confirm with the user before moving to the next.
5. Never hardcode hex values — always use the CSS variables defined below.
6. Never add features or pages not listed here — scope creep is not allowed.

---

## Reference Site — Component & Layout Inspiration

The reference site is **al-madrasatu ar-rahmaniyyah** (`www.rahmaniyyah.com`).
A full-page screenshot has been provided. Study it for **layout structure and component patterns only** — not colors, not fonts, not brand.

### What to take from the reference site

| Component | What to borrow | What to ignore |
|---|---|---|
| **Navbar** | Centered logo with site name below, nav links left + right, single CTA button (pill/rounded) on the right | Orange color, specific font |
| **Hero section** | Small eyebrow label above headline, large bold headline (2 lines), short subtext paragraph, single large CTA button centered, social proof / announcement ticker below button | Orange button color, teal accent |
| **Announcement bar / ticker** | Thin pill-shaped scrolling or static banner just below the hero CTA — used for promotions or announcements | Color |
| **Roadmap / timeline section** | Centered vertical spine with date markers, cards branching left and right alternately, date chips on the spine itself, expand (`+`) button on each card | Colors |
| **Programme cards (features section)** | 2-column card grid, icon top-left, title, subtitle, bullet-point feature list with checkmarks, a badge label (e.g. "5 YEAR PROGRAMME"), CTA button full-width at bottom | Orange button |
| **Pricing section** | Monthly / Annual toggle (pill tabs), 2-column pricing cards side by side, large price display, feature list with colored checkmarks, CTA button full-width | Colors |
| **Pricing toggle** | Pill-shaped toggle with active state highlight, "Save" badge on the Annual tab | Colors |
| **Footer** | Logo left, nav links center, copyright text left, tagline right — clean minimal two-row footer | Colors |
| **Section eyebrow labels** | Small all-caps label with a dot/diamond icon, centered above section titles | Orange color |
| **Section layout** | Each section visually separated with generous vertical padding, centered heading + subtitle, then content below | — |

### What NOT to copy from the reference site

- Orange buttons or accents → use Maktabah green instead
- Teal/cyan text highlights → use Maktabah gold instead
- Their logo or branding
- Light or white section backgrounds → stay dark throughout

---

## Overall Feel

**Feel:** Dark, scholarly, professional, and cozy. Like stepping into a well-lit library at night — refined, trustworthy, deeply intentional. Not a casual app. Not a children's platform. A serious digital home for students of Islamic knowledge.

**Theme:** Dark exclusively — no light mode.

**User:** A serious Muslim student seeking classical Islamic sciences — Fiqh, Aqeedah, Hadith, Tafsir. Someone who respects tradition and expects a polished, mature interface.

---

## Color Palette

| Role | Name | Hex |
|---|---|---|
| Background (base) | Deep charcoal-green | `#0d1210` |
| Surface (cards, panels) | Dark surface | `#131a16` |
| Surface elevated | Slightly lighter panel | `#1a2420` |
| Glass surface | Frosted glass base | `rgba(26, 36, 32, 0.60)` |
| Glass surface hover | Frosted glass hover | `rgba(30, 44, 38, 0.75)` |
| Primary accent | Forest green | `#4a7c59` |
| Primary accent light | Sage green | `#6aab7e` |
| Primary accent muted | Deep muted green | `#2e4f3a` |
| Green glow | Transparent green glow | `rgba(74, 124, 89, 0.18)` |
| Secondary accent | Warm gold | `#c9933a` |
| Secondary accent light | Amber gold | `#e0b060` |
| Secondary accent muted | Transparent gold tint | `rgba(201, 147, 58, 0.15)` |
| Text — primary | Near-white with green tint | `#eef2ee` |
| Text — secondary (muted) | Muted sage | `#8fa898` |
| Text — faint | Very muted | `#506358` |
| Border subtle | Barely visible green | `rgba(74, 124, 89, 0.15)` |
| Border glass | Glass card border | `rgba(74, 124, 89, 0.25)` |
| Border gold | Gold card border | `rgba(201, 147, 58, 0.30)` |
| Success / complete | Same as green light | `#6aab7e` |
| Warning / upgrade | Gold | `#c9933a` |
| Danger / remove | Muted red | `#c06060` |

### CSS Variables — paste into global stylesheet

```css
:root {
  --bg-base:           #0d1210;
  --bg-surface:        #131a16;
  --bg-elevated:       #1a2420;
  --bg-glass:          rgba(26, 36, 32, 0.60);
  --bg-glass-hover:    rgba(30, 44, 38, 0.75);

  --green-primary:     #4a7c59;
  --green-light:       #6aab7e;
  --green-muted:       #2e4f3a;
  --green-glow:        rgba(74, 124, 89, 0.18);

  --gold-primary:      #c9933a;
  --gold-light:        #e0b060;
  --gold-muted:        rgba(201, 147, 58, 0.15);

  --text-primary:      #eef2ee;
  --text-secondary:    #8fa898;
  --text-muted:        #506358; 

  --border-subtle:     rgba(74, 124, 89, 0.15);
  --border-glass:      rgba(74, 124, 89, 0.25);
  --border-gold:       rgba(201, 147, 58, 0.30);

  --danger:            #c06060;
}
```

---

## Typography

**Heading font:** `'Playfair Display'` — hero headlines, page titles, section titles. Scholarly editorial weight.

**Body / UI font:** `'Inter'` — all UI text, labels, buttons, body copy.

**Fallback stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Google Fonts import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
```

### Type Scale

| Role | Size | Weight | Font | Notes |
|---|---|---|---|---|
| Hero headline | `clamp(2.5rem, 5vw, 3.75rem)` | 700 | Playfair Display | `letter-spacing: -0.02em`, `line-height: 1.15` |
| Page heading | `1.625–1.75rem` | 700 | Playfair Display | `letter-spacing: -0.02em` |
| Section heading | `1.125–1.375rem` | 700 | Inter | `letter-spacing: -0.01em` |
| Card title | `1.0625–1.1875rem` | 600 | Inter | |
| Body / UI text | `0.9375rem` (15px) | 400 | Inter | `line-height: 1.6–1.7` |
| Small labels | `0.875rem` (14px) | 500 | Inter | |
| Micro / badges | `0.75–0.8125rem` | 600 | Inter | |
| Eyebrow / caps labels | `0.625–0.6875rem` | 600 | Inter | `letter-spacing: 0.08em`, `text-transform: uppercase` |

### Stylistic Rules

- Negative `letter-spacing` (`-0.02em` to `-0.03em`) on all large headings
- Positive `letter-spacing` (`0.06–0.08em`) + `text-transform: uppercase` on eyebrow labels
- Line heights: tight on headings (`1.1–1.3`), relaxed on body (`1.6–1.7`)
- Weights: 400, 500, 600, 700 only
- Accent words in headings: wrap in `<span>` with `color: var(--green-light)` or `color: var(--gold-light)` — never styled as italic

---

## Component Library

Each component below maps to one seen in the reference site — adapted to Maktabah's palette and context.

---

### 1. Navbar

**Reference:** Centered logo/wordmark, nav links spread left and right, single pill CTA on far right.

- Position: sticky, `top: 0`, `z-index: 100`
- Background: `rgba(13, 18, 16, 0.85)`, `backdrop-filter: blur(20px)`
- Border bottom: `1px solid var(--border-subtle)`
- Height: `64px`
- Logo: Arabic `مكتبة` + "Maktabah" in `var(--green-light)`, Playfair Display
- Nav links: `0.875rem`, weight 500, `var(--text-secondary)` → hover `var(--text-primary)`
- CTA button: `border-radius: 100px`, `background: var(--green-muted)`, border `var(--border-glass)`, text `var(--green-light)`, weight 600

---

### 2. Hero Section

**Reference:** Eyebrow → 2-line headline → subtext → large CTA → announcement strip below.

- Min-height: `72vh`, flex center
- Background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,124,89,0.12), transparent)` + faint gold side glow
- Eyebrow: pill shape, `var(--green-glow)` bg, `var(--green-light)` text, `◆` prefix, `border-radius: 100px`
- Headline: Playfair Display, `clamp(2.5rem, 5vw, 3.75rem)`, one accent word in `var(--gold-light)`
- Subtext: `0.9375rem`, `var(--text-secondary)`, max-width `480px`
- Primary CTA: green primary button
- Below CTA: announcement strip (see component 3)

---

### 3. Announcement Strip

**Reference:** Thin pill below hero CTA, single line promotion or news item.

- Background: `var(--gold-muted)`, border: `1px solid var(--border-gold)`, `border-radius: 100px`
- Font: `0.75rem`, weight 500, `var(--gold-light)`
- Prefix: `◆` or relevant emoji
- Suffix: `→` if it's a link

---

### 4. Roadmap / Timeline

**Reference:** Vertical center spine, date chips on spine, cards alternate left/right, `+` expand on each card.

- Section eyebrow: `◆ YOUR PATH` in `var(--gold-light)`
- Section title: Playfair Display, accent word in `var(--green-light)`
- Spine: `2px`, `linear-gradient(to bottom, var(--green-primary), var(--green-muted))`
- Date chip on spine: small pill, `var(--bg-elevated)` bg, `var(--border-gold)` border, `var(--gold-light)` text, `0.625rem` caps
- Layout: 3-column grid `1fr 48px 1fr` — alternating left card / node / right card
- Node circle: `48px`, `var(--bg-elevated)` bg, `2px solid var(--green-primary)` border, green glow
- Gold node variant: for milestone stages — border and glow in gold
- Cards: glass card style, `roadmap-date` label in `var(--gold-light)` uppercase
- Expand button `+`: ghost circle, `border: 1px solid var(--border-glass)`, appears on hover

---

### 5. Programme / Feature Cards

**Reference:** 2-column grid, icon + title + subtitle + checkmark bullet list + badge + full-width CTA.

- Grid: `1fr 1fr` desktop, `1fr` mobile
- Card: glass card style
- Icon: `48px` circle, `var(--green-glow)` bg, `var(--green-primary)` border
- Title: `1.1875rem`, weight 700
- Subtitle: `0.875rem`, `var(--text-secondary)`
- Feature list: `0.875rem`, `var(--text-secondary)`, each item prefixed with `✓` in `var(--green-light)`, `gap: 0.5rem`
- Badge: small pill, `var(--green-muted)` bg, `var(--green-light)` text, `0.625rem` caps (e.g. "STARTING JAN 2025")
- CTA: green primary button, `width: 100%`, pinned to card bottom

---

### 6. Pricing Section

**Reference:** Eyebrow + heading + subtitle. Monthly/Annual toggle. 2-column pricing cards. Price + features + CTA per card.

- Section eyebrow: `◆ CHOOSE YOUR PATH` in `var(--gold-light)`
- Toggle: pill row, active = `var(--green-muted)` bg + `var(--green-light)` text + `var(--border-glass)` border, inactive = transparent. "Save" badge on Annual tab: `var(--gold-muted)` bg, `var(--gold-light)` text, `border-radius: 4px`, `0.5rem`
- Pricing card: gold variant glass card (`var(--border-gold)` border)
- Price display: Playfair Display `2.25rem` weight 700 `var(--text-primary)`. Currency symbol `var(--gold-light)` at `1.25rem`. `/month` suffix `var(--text-secondary)` at `0.875rem`
- Feature list: `0.875rem`, checkmarks `✓` in `var(--gold-light)`
- CTA: gold primary button, `width: 100%`
- Below cards: "View full plan comparison →" centered, `var(--text-secondary)`, small

---

### 7. Footer

**Reference:** Two rows. Logo + utility links. Copyright + tagline.

- Background: `var(--bg-surface)`, border-top: `1px solid var(--border-subtle)`
- Padding: `2.5rem 0`
- Row 1: logo left, utility links center (`var(--text-secondary)` `0.8125rem`, separated by `·`)
- Row 2: copyright left `var(--text-muted)` `0.75rem`, Islamic quote right `var(--text-muted)` `0.75rem`
- Suggested quote: *"Seeking knowledge is an obligation upon every Muslim."*
- Minimal — no heavy decoration

---

### 8. Cards (Glass — General)

```css
background: var(--bg-glass);
backdrop-filter: blur(16px);
border: 1px solid var(--border-glass);
border-radius: 16px;
padding: 1.75rem;
transition: all 0.25s ease;
```
`::before` inner highlight: `linear-gradient(135deg, rgba(74,124,89,0.06) 0%, transparent 60%)`

Hover: `var(--bg-glass-hover)` bg, border → `var(--green-primary)`, `translateY(-2px)`, `box-shadow: 0 8px 40px rgba(74, 124, 89, 0.15)`

**Gold variant:** border `var(--border-gold)`, `::before` uses gold tint

---

### 9. Buttons

**Primary (green):**
```css
background: linear-gradient(135deg, var(--green-primary), #3d6b4a);
border: 1px solid var(--green-light);
color: #fff; border-radius: 10px;
padding: 0.8125rem 1.75rem;
font-size: 0.9375rem; font-weight: 600;
box-shadow: 0 4px 24px rgba(74, 124, 89, 0.3), inset 0 1px 0 rgba(255,255,255,0.08);
```
Hover: lighter gradient, stronger shadow, `translateY(-1px)`

**Gold / pricing CTA:**
```css
background: linear-gradient(135deg, var(--gold-primary), #b07a28);
border: 1px solid var(--gold-light);
color: #fff; border-radius: 10px;
box-shadow: 0 4px 24px rgba(201, 147, 58, 0.25);
```
Hover: `translateY(-1px)`, stronger shadow

**Secondary (ghost):**
```css
background: transparent;
border: 1px solid var(--border-glass);
color: var(--text-secondary); border-radius: 10px;
padding: 0.8125rem 1.75rem;
```
Hover: border → `var(--green-primary)`, text → `var(--text-primary)`

**Nav / pill:**
```css
background: var(--green-muted);
border: 1px solid var(--border-glass);
color: var(--green-light); border-radius: 100px;
padding: 0.5rem 1.25rem;
font-size: 0.875rem; font-weight: 600;
```

---

### 10. Section Eyebrows

```css
display: inline-flex; align-items: center; gap: 0.5rem;
font-size: 0.6875rem; font-weight: 600;
letter-spacing: 0.08em; text-transform: uppercase;
color: var(--gold-light); /* or var(--green-light) for feature sections */
```
Always prefix with `◆` diamond character.

---

### 11. Badges & Tags

**Level badges** — `border-radius: 6px`, `font-size: 0.75rem`, `font-weight: 600`, `padding: 0.2rem 0.625rem`

| Level | Background | Text | Border |
|---|---|---|---|
| Beginner | `rgba(74, 124, 89, 0.20)` | `#7ec896` | `rgba(74, 124, 89, 0.30)` |
| Intermediate | `rgba(201, 147, 58, 0.15)` | `var(--gold-light)` | `rgba(201, 147, 58, 0.25)` |
| Advanced | `rgba(180, 80, 80, 0.15)` | `#e08080` | `rgba(180, 80, 80, 0.25)` |

**Category tags** — `border-radius: 100px`, `font-size: 0.6875rem`, `font-weight: 600`, `letter-spacing: 0.04em`, `padding: 0.2rem 0.625rem`

| Variant | Background | Text | Border |
|---|---|---|---|
| Green | `var(--green-glow)` | `var(--green-light)` | `rgba(74, 124, 89, 0.30)` |
| Gold | `var(--gold-muted)` | `var(--gold-light)` | `rgba(201, 147, 58, 0.25)` |
| Muted | `rgba(255,255,255,0.05)` | `var(--text-muted)` | `rgba(255,255,255,0.08)` |

---

### 12. Madhab Cards (Fiqh Tool)

Glass card with `3px` bottom accent bar (`::after`, gradient fades from center). Each madhab has its own color.

| Madhab | Accent | Border | Bottom bar |
|---|---|---|---|
| Hanafi | `#6495ed` (blue) | `rgba(100, 149, 237, 0.25)` | blue gradient |
| Maliki | `#4a7c59` (green) | `rgba(74, 124, 89, 0.35)` | green gradient |
| Shafi'i | `#c9933a` (gold) | `rgba(201, 147, 58, 0.30)` | gold gradient |
| Hanbali | `#b47878` (rose) | `rgba(180, 120, 120, 0.25)` | rose gradient |

Hover: `translateY(-3px)`, `box-shadow: 0 8px 32px rgba(0,0,0,0.3)`

---

### 13. Search Input

```css
background: var(--bg-glass); backdrop-filter: blur(16px);
border: 1px solid var(--border-glass); border-radius: 12px;
padding: 0.875rem 1rem 0.875rem 3rem;
color: var(--text-primary); font-size: 0.9375rem;
```
Focus: border → `var(--green-primary)`, `box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.15)`
Placeholder: `var(--text-muted)`

---

### 14. Dividers

```css
border: none; height: 1px;
background: linear-gradient(90deg, transparent, var(--border-glass), transparent);
```

---

### 15. Stats Row

4-column grid, `1px` gap, wrapper bg = `var(--border-subtle)`, cells = `var(--bg-surface)`. Numbers: Playfair Display, alternating `var(--green-light)` and `var(--gold-light)`.

---

## Layout Preferences

- **Max content width:** `1120px`, centered, `padding: 0 2rem`
- **Section padding:** `5rem 0` standard, `4rem 0` tighter
- **Spacing:** comfortable to spacious — never cramped
- **Cards grid:** 3 col desktop → 2 tablet → 1 mobile
- **Breakpoint:** `768px`
- **Background texture:** subtle SVG noise `::before` on body, `position: fixed`, `opacity: 0.03–0.05`
- **Radial glows:** green top-center on hero, faint gold side — always subtle

---

## Page Order for Redesign

Complete and confirm each before moving on.

1. ~~`home.js` + `navbar.js`~~ ✅ **DONE — confirmed by user (2026-03-09)**
2. ~~`account.js`~~ ✅ **DONE — confirmed by user (2026-03-09)**
3. ~~`library.js`~~ ✅ **DONE — confirmed by user (2026-03-09)**
4. ~~`roadmap.js`~~ ✅ **DONE — confirmed by user (2026-03-09)**
5. ~~`fiqhtool.js`~~ ✅ **DONE — confirmed by user (2026-03-09)**
6. ~~`login.js` + `register.js`~~ ✅ **DONE — confirmed by user (2026-03-09)**
7. ~~`admin.js` + `scholar.js`~~ ✅ **DONE — confirmed by user (2026-03-10)**

---

## What to Keep

- Page structure and routing
- All existing functionality (search, filters, roadmap logic)
- Information architecture — restyle only, do not restructure

## What to Change

- All colors → use palette above
- Light/white surfaces → dark surfaces
- Flat cards → glassmorphism
- Generic buttons → green / gold / ghost system
- Sections lacking breathing room → add padding
- `#ffffff` text → `var(--text-primary)`
- `#000000` backgrounds → `var(--bg-base)`

---

## Implemented Design Decisions (confirmed by user — do not change)

These values were tuned and approved. Use them exactly.

| Token | Value |
|---|---|
| `--bg-base` | `#192620` |
| `--bg-surface` | `#1e2d25` |
| `--bg-elevated` | `#263d32` |
| Card background | `#223328` (solid, no backdrop-filter) |
| Card hover background | `#28402f` |
| Gold card hover | `#2c2612` |
| Navbar background | `var(--bg-surface)` — solid, no blur |
| Nav link color | `var(--gold-light)` |
| Nav link hover bg | `var(--gold-muted)` |
| Nav CTA | gold pill — `var(--gold-muted)` bg, `var(--border-gold)` border |
| Navbar height | `72px` |
| Navbar layout | `grid-template-columns: 1fr auto 1fr` — left links / center logo / right CTA |
| Logo | Arabic `مكتبة` (Playfair Display 1.375rem) stacked over `MAKTABAH` (Inter caps 0.625rem, var(--text-muted)) |
| Nav link font size | `0.9375rem` (15px), padding `0.5rem 0.875rem` |
| Glass card | `background: #223328`, `border: 1px solid rgba(74,124,89,0.22)`, `border-radius: 16px`, `box-shadow: inset 0 1px 0 rgba(106,171,126,0.09), 0 4px 24px rgba(0,0,0,0.28)` |
| Card text — title | `#e8f0e9` |
| Card text — subtitle/body | `#99b8a6` |
| Card text — list items | `#8daa99` |
| Checkmarks in lists | `var(--green-light)` via `::before` pseudo |
| Gold checkmarks | `var(--gold-light)` via `.gold-checks li::before` |
| Pricing toggle | pill row with `border: 1px solid var(--border-gold)`, active = `var(--gold-muted)` bg |
| Section eyebrow | gold pill: `var(--gold-muted)` bg, `var(--border-gold)` border, `var(--gold-light)` text, `border-radius: 100px` |
| Section eyebrow (green) | same but green: `.eyebrow-label.green` class |
| Primary CTA button | `linear-gradient(135deg, var(--green-primary), #3d6b4a)`, green border, `border-radius: 10px` |
| Gold CTA button | `linear-gradient(135deg, var(--gold-primary), #b07a28)`, gold border |
| Ghost button | transparent, `var(--border-glass)` border, `var(--text-secondary)` text |
| Pricing | Monthly 129kr, Yearly 1160kr (25% off). STRIPE_YEARLY_PRICE_ID env var required |
| "Begin Your Journey" btn | Links to `#/account` (NOT `#/register`) — user must be logged in to subscribe |
| Library / Roadmap / Fiqh hero | Shared `library-hero` + `library-hero-inner` pattern — eyebrow + Playfair title + subtitle. Margin `-2.5rem -2rem 2.5rem` pulls it edge-to-edge above `.page-content` padding |
| Field card accent bar | `height: 3px`, `opacity: 0.7` — thin colored line at top. Colors: Aqeedah=`#6aab7e`, Fiqh=`#6495ed`, Hadith=`#e0b060`, Seerah=`#b47878` |
| Field/Book card hover | `background: #28402f`, `border-color: var(--green-primary)` |
| Level badges | Beginner: green tint + `#7ec896`. Intermediate: gold tint + `var(--gold-light)`. Advanced: red tint + `#e08080`. All `border-radius: 6px` |
| Download btn | Green gradient (`var(--green-primary)` → `#3d6b4a`), green border, green glow shadow |
| Upgrade btn | Gold gradient, gold border |
| Roadmap left panel | `#223328` dark glass card, `position: sticky`, `top: calc(72px + 1.5rem)` |
| Field selector btns | `var(--bg-elevated)` base, `var(--border-glass)` border. Active: `var(--green-muted)` bg + field `accent` as border/box-shadow/color (inline) |
| Path node circles | Available: green-muted→green-primary gradient + border. Completed: green-primary→green-light + border. Locked: `var(--bg-elevated)` + `var(--border-glass)` |
| Path connectors | `var(--border-glass)` inactive, `var(--green-primary)` completed |
| Step detail card | `var(--bg-elevated)` bg, `var(--border-subtle)` border. Completed: `rgba(74,124,89,0.08)` bg |
| Step unlock btn | Green gradient + `var(--green-light)` border (same as download-btn) |
| Category pills | Same pill style as filter-btn: transparent + `var(--border-glass)`. Active: `var(--green-muted)` + `var(--green-primary)` border |
| Search input | `var(--bg-elevated)` bg, `var(--border-glass)` border, `border-radius: 12px`, left padding 3rem for icon. Parent `.fiqh-search-bar` has `::before` search icon |
| Madhab cards | `#223328` bg, per-madhab border color, `border-radius: 12px`, `::after` 3px gradient bottom bar. Hanafi=blue `#6495ed`, Maliki=green `#4a7c59`, Shafi'i=gold `#c9933a`, Hanbali=rose `#b47878` |
| Upgrade modal | Class `upgrade-modal`, accent bar class `upgrade-modal-accent` (green→gold gradient), eyebrow label + `btn-gold-full` button — no inline styles |

---

## Hard Rules for Claude Code

- Read this entire file before every session — no exceptions
- Use CSS variables — never hardcode hex values inline
- **Do NOT use `backdrop-filter`** on cards — use solid dark backgrounds instead (confirmed pattern)
- `◆` diamond is the consistent decorative marker for all eyebrows and labels
- Green = primary system color. Gold = upgrades, milestones, pricing, navbar
- Playfair Display = headings only. Inter = everything else
- Never `#ffffff` for text. Never `#000000` for backgrounds
- One page at a time — always confirm with user before proceeding to next page
- Match the established card/text colors exactly — do not revert to CSS variables for card internals