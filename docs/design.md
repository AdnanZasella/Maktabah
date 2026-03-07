# Maktabah — Design Guide

This file is read by Claude Code at the start of every Step 21 session (frontend redesign).
Do not start any redesign session without reading this file first.
Apply these rules consistently across every page — never deviate from the color palette or feel.

---

## Reference Websites

Sites whose aesthetic, layout, or feel I want to draw inspiration from.
For each session paste a screenshot and note what specifically you liked about it.

| Site | URL | What I like about it |
|---|---|---|
| Example | https://... | e.g. the card layout, dark background, clean spacing |
| Example | https://... | e.g. the typography weight, gold accents |

---

## Overall Feel

<!-- Describe in a few words the feeling the platform should give -->
<!-- Examples: premium and scholarly / clean and minimal / dark and elegant / warm and traditional -->

**Feel:**

**Light or dark theme:**

**What kind of user should feel at home here:** A serious Muslim student of knowledge — not a casual app, not a children's platform. Scholarly, clean, trustworthy.

---

## Color Palette

<!-- Fill these in when you have decided. Use hex codes. -->

| Role | Color | Hex |
|---|---|---|
| Background | | |
| Surface (cards, panels) | | |
| Primary accent | | |
| Secondary accent | | |
| Text — primary | | |
| Text — secondary (muted) | | |
| Success / complete | | |
| Warning / upgrade prompt | | |
| Danger / remove | | |

---

## Typography

**Heading font:**
**Body font:**
**Notes:** <!-- e.g. Arabic text should use a specific font, font sizes, weight preferences -->

---

## Component Style

**Cards:**
<!-- e.g. rounded corners, subtle shadow, border or no border, hover effect -->

**Buttons:**
<!-- e.g. filled vs outline, rounded vs sharp, size -->

**Navigation bar:**
<!-- e.g. sticky, transparent on hero, solid background, border bottom -->

**Madhab cards (fiqh tool):**
- Hanafi color:
- Maliki color:
- Shafi'i color:
- Hanbali color:

**Level badges (books):**
- Beginner color:
- Intermediate color:
- Advanced color:

**Roadmap nodes:**
<!-- e.g. circle style, completed vs incomplete look, connector line style -->

---

## Layout Preferences

**Max content width:**
**Spacing feel:** <!-- tight / comfortable / spacious -->
**Mobile:** <!-- any specific mobile preferences -->

---

## What to Keep from Current Design

<!-- List anything from the existing frontend that is working and should not change -->
-
-

## What to Definitely Change

<!-- List anything you know you want gone or improved -->
-
-

---

## Page Order for Redesign

Work through pages in this order — complete and confirm each before moving to the next.

1. `library.js` — main page, gets the design language right first
2. `roadmap.js`
3. `fiqhtool.js`
4. `login.js` and `register.js` (do together, they are similar)
5. `account.js`
6. `scholar.js`
7. `navbar.js` and shared components last — these tie everything together