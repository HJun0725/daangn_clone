# DESIGN.md — Karrot (당근마켓) clone design reference

Design rules and values for this project, taken from **SEED Design**, Karrot's official design system (https://seed-design.io). Captured 2026-11-16.

**About the source.** SEED's documentation is published in Korean only; there is no English original. This file is an English translation and condensation of it. Token names (`$color.bg.brand-solid`, `$dimension.x4`, …), variant names (`brandSolid`, `outlineWeak`, …) and all numeric values are copied verbatim from SEED, so they can be matched against the original. Each section ends with a `Source:` link to the original document.

## 0. Rules

1. **Use semantic color tokens, not raw colors.** In UI code reference a role token such as `$color.bg.brand-solid`. Do not use palette tokens (`$color.palette.carrot-600`) or hex values directly. Dark mode is resolved per semantic token.
2. **Pick spacing, radius and font sizes from the scales below.** Do not invent values such as `13px` padding or `7px` radius.
3. **Use the brand color (carrot orange) sparingly.** It is reserved for actions that connect neighbors or are core to the service, such as "채팅하기" (Chat) and "글쓰기" (Write a post). One Brand Solid button per screen.
4. **Mobile first.** Default horizontal screen padding is 16px (`$dimension.spacing-x.global-gutter`).
5. **The app's UI copy is Korean.** This document is in English, but labels shown to users stay in Korean.

Notation: 8-digit hex is `#RRGGBBAA`. All sizes are px unless stated otherwise. "Light / Dark" means the value in light theme / dark theme.

---

## 1. Color

### 1.1 Palette — light theme

Token pattern: `$color.palette.{hue}-{step}`.

| hue | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000 |
|---|---|---|---|---|---|---|---|---|---|---|
| gray | `#f7f8f9` | `#f3f4f5` | `#eeeff1` | `#dcdee3` | `#d1d3d8` | `#b0b3ba` | `#868b94` | `#555d6d` | `#2a3038` | `#1a1c20` |
| carrot | `#fff2ec` | `#ffe8db` | `#ffd5c0` | `#ffb999` | `#ff9364` | `#ff6600` | `#e14d00` | `#b93901` | `#862b00` | `#471601` |
| blue | `#eff6ff` | `#e2edfc` | `#cbdffa` | `#aacefd` | `#85b8fd` | `#5e98fe` | `#217cf9` | `#135fcd` | `#0b4596` | `#032451` |
| red | `#fdf0f0` | `#fde7e7` | `#fed4d2` | `#feb7b3` | `#fe928d` | `#fc6a66` | `#fa342c` | `#ca1d13` | `#921708` | `#4a1209` |
| green | `#edfaf6` | `#d9f6e9` | `#b9e9d2` | `#7ddcb3` | `#42c593` | `#10ab7d` | `#079171` | `#00745f` | `#075445` | `#0a2b24` |
| yellow | `#fff7de` | `#fdefb9` | `#fbdc65` | `#e9c647` | `#d4ab28` | `#c49725` | `#9b7821` | `#755b22` | `#4f3e1f` | `#2c2512` |
| purple | `#f5f3fe` | `#efeafe` | `#e1d8ff` | `#d0c0ff` | `#b8a1ff` | `#9f84fb` | `#8969ea` | `#6d50cb` | `#50379b` | `#29175d` |
| gray-alpha | `#00204008` | `#14273b0d` | `#000f2d11` | `#000f3323` | `#05102b2f` | `#000a204f` | `#000b1e79` | `#010d25ab` | `#000711d5` | `#000207e5` |

`gray-00` is `#ffffff`. The Karrot brand orange is **carrot-600 `#ff6600`**.

### 1.2 Palette — dark theme

| hue | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000 |
|---|---|---|---|---|---|---|---|---|---|---|
| gray | `#16171b` | `#1d2025` | `#2b2e35` | `#393d46` | `#5b606a` | `#868b94` | `#b0b3ba` | `#dcdee3` | `#e9eaec` | `#f3f4f5` |
| carrot | `#31241f` | `#4b291c` | `#6b311c` | `#923600` | `#bd4201` | `#e65200` | `#ff6600` | `#ff9e65` | `#eecebc` | `#f4eeea` |
| blue | `#202742` | `#1e3352` | `#1a4275` | `#0f559e` | `#1964d8` | `#1e82eb` | `#41a2f9` | `#83bcf9` | `#b9d7fb` | `#e5f0fe` |
| red | `#322323` | `#4f2624` | `#742826` | `#a12621` | `#ca2319` | `#f73526` | `#ff6e60` | `#ffa299` | `#f8c5c3` | `#fdf2f2` |
| green | `#202926` | `#20362e` | `#20493b` | `#19604c` | `#117956` | `#1b946d` | `#22b27f` | `#35ce9a` | `#93e5c0` | `#d4f6ef` |
| yellow | `#302819` | `#413218` | `#543e15` | `#714e15` | `#91601b` | `#b6720d` | `#ca901c` | `#dab156` | `#e5d49b` | `#f7f0cd` |
| purple | `#28213b` | `#3b2873` | `#443081` | `#5a3bb1` | `#764fd9` | `#8e6bee` | `#a78df0` | `#beadf2` | `#d9cefa` | `#f0edfc` |
| gray-alpha | `#d0d9ff1b` | `#c8ddff25` | `#cfddff35` | `#d0deff46` | `#dbe7ff6a` | `#e7efff94` | `#f1f5ffba` | `#f7f9ffe3` | `#fcfdffec` | `#fdfefff5` |

`gray-00` is `#000000` in dark theme.

### 1.3 Static palette (same in both themes)

| token | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| static-black-alpha | – | `#00000007` | `#0000000c` | `#00000010` | `#00000021` | `#0000002c` | `#0000004c` | `#00000074` | `#000000a2` | `#000000d0` | `#000000e3` |
| static-white-alpha | `#ffffff0d` | `#ffffff17` | `#ffffff20` | `#ffffff2e` | `#ffffff3d` | `#ffffff60` | `#ffffff8b` | `#ffffffb3` | `#ffffffde` | `#ffffffea` | `#fffffff4` |

`static-black` is `#000000`, `static-white` is `#ffffff`.

Source: https://seed-design.io/llms/foundations/color/palette.txt

### 1.4 Semantic tokens

Token structure: `$color.{property}.{role}-{variant}[-pressed]`.

- **property**: `fg` (text, icons), `bg` (surfaces), `stroke` (borders, dividers)
- **role**: `brand`, `neutral`, `positive`, `warning`, `critical`, `informative`
- **variant**: `solid` (strong), `weak` (soft), plus `muted`, `subtle`, `contrast`, `inverted`
- "Palette ref" is SEED's own definition. `a → b` means light theme uses `a`, dark theme uses `b`.

#### Foreground — `$color.fg.*`

| token | use | palette ref | Light | Dark |
|---|---|---|---|---|
| `neutral` | default text | gray-1000 | `#1a1c20` | `#f3f4f5` |
| `neutral-muted` | secondary text | gray-800 | `#555d6d` | `#dcdee3` |
| `neutral-subtle` | tertiary text (time, location, counts) | gray-700 | `#868b94` | `#b0b3ba` |
| `neutral-inverted` | text on inverted surface | gray-00 → gray-100 | `#ffffff` | `#16171b` |
| `placeholder` | input placeholder | gray-600 | `#b0b3ba` | `#868b94` |
| `disabled` | disabled text/icon | gray-500 | `#d1d3d8` | `#5b606a` |
| `brand` | brand-colored text/icon | carrot-600 → carrot-700 | `#ff6600` | `#ff6600` |
| `brand-contrast` | text on `bg.brand-weak` | carrot-700 | `#e14d00` | `#ff6600` |
| `critical` | error | red-700 | `#fa342c` | `#ff6e60` |
| `critical-contrast` | text on `bg.critical-weak` | red-900 | `#921708` | `#f8c5c3` |
| `positive` | success | green-700 | `#079171` | `#22b27f` |
| `positive-contrast` | text on `bg.positive-weak` | green-900 | `#075445` | `#93e5c0` |
| `informative` | info | blue-700 | `#217cf9` | `#41a2f9` |
| `informative-contrast` | text on `bg.informative-weak` | blue-900 | `#0b4596` | `#b9d7fb` |
| `warning` | warning | yellow-700 | `#9b7821` | `#ca901c` |
| `warning-contrast` | text on `bg.warning-weak` | yellow-900 | `#4f3e1f` | `#e5d49b` |
| `on-brand-solid` | on `bg.brand-solid` | static-white | `#ffffff` | `#ffffff` |
| `on-critical-solid` | on `bg.critical-solid` | static-white | `#ffffff` | `#ffffff` |
| `on-informative-solid` | on `bg.informative-solid` | static-white | `#ffffff` | `#ffffff` |
| `on-positive-solid` | on `bg.positive-solid` | static-white | `#ffffff` | `#ffffff` |
| `on-neutral-solid` | on `bg.neutral-solid` | gray-00 → gray-100 | `#ffffff` | `#16171b` |
| `on-warning-solid` | on `bg.warning-solid` | static-black-alpha-900 | `#000000d0` | `#000000d0` |

#### Background — `$color.bg.*`

| token | use | palette ref | Light | Dark |
|---|---|---|---|---|
| `layer-basement` | lowest backdrop, visible in gaps between sections | gray-200 → gray-00 | `#f3f4f5` | `#000000` |
| `layer-default` | pages, cards, lists, navigation bars | gray-00 → gray-100 | `#ffffff` | `#16171b` |
| `layer-default-pressed` | | gray-100 → gray-300 | `#f7f8f9` | `#2b2e35` |
| `layer-floating` | bottom sheets, menus | gray-00 → gray-200 | `#ffffff` | `#1d2025` |
| `layer-floating-pressed` | | gray-100 → gray-300 | `#f7f8f9` | `#2b2e35` |
| `brand-solid` | core CTA, FAB, notification badge | carrot-600 → carrot-700 | `#ff6600` | `#ff6600` |
| `brand-solid-pressed` | | carrot-700 → carrot-800 | `#e14d00` | `#ff9e65` |
| `brand-weak` | soft brand highlight | carrot-100 | `#fff2ec` | `#31241f` |
| `brand-weak-pressed` | | carrot-200 | `#ffe8db` | `#4b291c` |
| `neutral-solid` | default CTA, snackbar, selected chip | gray-900 → gray-1000 | `#2a3038` | `#f3f4f5` |
| `neutral-solid-pressed` | | gray-800 | `#555d6d` | `#dcdee3` |
| `neutral-inverted` | inverted surface | gray-900 → gray-1000 | `#2a3038` | `#f3f4f5` |
| `neutral-inverted-pressed` | | gray-800 | `#555d6d` | `#dcdee3` |
| `neutral-weak` | secondary button, gray badge | gray-200 → gray-300 | `#f3f4f5` | `#2b2e35` |
| `neutral-weak-pressed` | | gray-300 → gray-400 | `#eeeff1` | `#393d46` |
| `neutral-weak-alpha` | solid chip background | gray-alpha-200 | `#14273b0d` | `#c8ddff25` |
| `neutral-weak-alpha-pressed` | | gray-alpha-300 | `#000f2d11` | `#cfddff35` |
| `neutral-muted` | very light gray surface | gray-100 → gray-200 | `#f7f8f9` | `#1d2025` |
| `neutral-subtle` | | gray-00 → gray-100 | `#ffffff` | `#16171b` |
| `disabled` | disabled surface | gray-200 → gray-300 | `#f3f4f5` | `#2b2e35` |
| `critical-solid` | destructive action | red-700 → red-600 | `#fa342c` | `#f73526` |
| `critical-solid-pressed` | | red-800 → red-700 | `#ca1d13` | `#ff6e60` |
| `critical-weak` | | red-100 | `#fdf0f0` | `#322323` |
| `critical-weak-pressed` | | red-200 | `#fde7e7` | `#4f2624` |
| `positive-solid` | | green-700 → green-500 | `#079171` | `#117956` |
| `positive-solid-pressed` | | green-800 → green-600 | `#00745f` | `#1b946d` |
| `positive-weak` | | green-100 | `#edfaf6` | `#202926` |
| `positive-weak-pressed` | | green-200 | `#d9f6e9` | `#20362e` |
| `informative-solid` | | blue-700 → blue-600 | `#217cf9` | `#1e82eb` |
| `informative-solid-pressed` | | blue-800 → blue-700 | `#135fcd` | `#41a2f9` |
| `informative-weak` | | blue-100 | `#eff6ff` | `#202742` |
| `informative-weak-pressed` | | blue-200 | `#e2edfc` | `#1e3352` |
| `warning-solid` | | yellow-300 → yellow-800 | `#fbdc65` | `#dab156` |
| `warning-solid-pressed` | | yellow-400 → yellow-900 | `#e9c647` | `#e5d49b` |
| `warning-weak` | | yellow-100 | `#fff7de` | `#302819` |
| `warning-weak-pressed` | | yellow-200 | `#fdefb9` | `#413218` |
| `magic-weak` | AI-feature surface | (literal) | `#f9f2ee` | `#201f1f` |
| `overlay` | dim behind modals | static-black-alpha-700 | `#00000074` | `#00000074` |
| `overlay-muted` | lighter dim | static-black-alpha-500 | `#0000002c` | `#0000002c` |
| `transparent` | no background | (literal) | `#00000000` | `#ffffff00` |
| `transparent-pressed` | press layer for elements without a background | static-black-alpha-100 → static-white-alpha-50 | `#00000007` | `#ffffff0d` |
| `transparent-selected` | | static-black-alpha-200 → static-white-alpha-100 | `#0000000c` | `#ffffff17` |
| `transparent-selected-pressed` | | static-black-alpha-300 → static-white-alpha-200 | `#00000010` | `#ffffff20` |

`bg.layer-basement` and `bg.neutral-weak` look the same in light theme but differ in dark theme. Use `layer-basement` for page backdrops and `neutral-weak` for component fills.

#### Stroke — `$color.stroke.*`

| token | use | palette ref | Light | Dark |
|---|---|---|---|---|
| `neutral-subtle` | dividers between repeated items (list rows) | static-black-alpha-200 → static-white-alpha-50 | `#0000000c` | `#ffffff0d` |
| `neutral-muted` | section dividers, outline buttons, chips | static-black-alpha-300 → static-white-alpha-100 | `#00000010` | `#ffffff17` |
| `neutral-weak` | elements whose shape is drawn only by a line (text input, checkbox) | gray-alpha-400 | `#000f3323` | `#d0deff46` |
| `neutral-solid` | | gray-800 | `#555d6d` | `#dcdee3` |
| `neutral-contrast` | focused input, selected chip | gray-1000 | `#1a1c20` | `#f3f4f5` |
| `brand-solid` | | carrot-700 | `#e14d00` | `#ff6600` |
| `brand-weak` | brand outline badge | carrot-300 | `#ffd5c0` | `#6b311c` |
| `critical-solid` | invalid input | red-700 | `#fa342c` | `#ff6e60` |
| `critical-weak` | | red-300 | `#fed4d2` | `#742826` |
| `positive-solid` | | green-700 | `#079171` | `#22b27f` |
| `positive-weak` | | green-300 | `#b9e9d2` | `#20493b` |
| `informative-solid` | | blue-700 | `#217cf9` | `#41a2f9` |
| `informative-weak` | | blue-300 | `#cbdffa` | `#1a4275` |
| `warning-solid` | | yellow-700 | `#9b7821` | `#ca901c` |
| `warning-weak` | | yellow-300 | `#fbdc65` | `#543e15` |
| `focus-ring` | keyboard focus ring | blue-600 | `#5e98fe` | `#1e82eb` |

Sources: https://seed-design.io/llms/foundations/color/color-role.txt · https://seed-design.io/llms/foundations/design-token/reference.txt

### 1.5 Manner temperature colors (매너온도)

A user's manner temperature maps to one of 10 levels. Tokens: `$color.manner-temp.l{1-10}.text` and `$color.manner-temp.l{1-10}.bg`. The temperature range of each level is not published.

| level | text Light | bg Light | text Dark | bg Dark |
|---|---|---|---|---|
| l1 | `#757b85` | `#f1f2f3` | `#b8b8b9` | `#292929` |
| l2 | `#ab863f` | `#f8f4ec` | `#f5db97` | `#332605` |
| l3 | `#e08a00` | `#fff5e5` | `#fdda65` | `#372b01` |
| l4 | `#f57e00` | `#fff3e5` | `#fbbe55` | `#372301` |
| l5 | `#ff7300` | `#fff1e5` | `#faac4b` | `#371f01` |
| l6 | `#ff6600` | `#fff0e5` | `#fc9855` | `#351b03` |
| l7 | `#ff5100` | `#ffefe5` | `#f97a25` | `#371701` |
| l8 | `#ff3300` | `#ffeee5` | `#fe6a34` | `#380f00` |
| l9 | `#e82c45` | `#fdeded` | `#fe6a5d` | `#380500` |
| l10 | `#cb0123` | `#ffebee` | `#fb6f82` | `#34040a` |

### 1.6 Banner backgrounds — `$color.banner.*`

| token | Light | Dark |
|---|---|---|
| blue | `#e1f7ff` | `#0d2a3a` |
| cool-gray | `#ebf1f5` | `#242c33` |
| green | `#f0fbe5` | `#1e361c` |
| orange | `#fff2e1` | `#42230a` |
| pink | `#ffebf1` | `#3b172c` |
| purple | `#f5ecff` | `#2e1e45` |
| red | `#ffecee` | `#3a0f15` |
| teal | `#e6faf6` | `#143633` |
| warm-gray | `#f2f0ee` | `#2f2b27` |
| yellow | `#fffae1` | `#3e2b00` |

---

## 2. Typography

### 2.1 Font family

System font on iOS, Android and macOS; **Pretendard** on Windows. The Pretendard web font must be loaded by the product. Declare the stack on `body`, not `html`.

```css
body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Pretendard Variable", Pretendard, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
}
```

Source: https://seed-design.io/llms/react/getting-started/styling/fonts.txt

### 2.2 Scale

Tokens: `$font-size.t{N}`, `$line-height.t{N}`. Pair a size with the line height of the same number. Use rem (1rem = 16px).

| step | font size | line height | typical use |
|---|---|---|---|
| t1 | 11 | 15 | badges, tiny labels |
| t2 | 12 | 16 | captions, subtitles |
| t3 | 13 | 18 | list detail text |
| t4 | 14 | 19 | button, chip and small tab labels; secondary body |
| t5 | 16 | 22 | default body, list titles |
| t6 | 18 | 24 | navigation title, large button |
| t7 | 20 | 27 | title |
| t8 | 22 | 30 | bottom sheet title |
| t9 | 24 | 32 | title |
| t10 | 26 | 35 | screen title |
| t11 | 28 | 38 | large title, only at viewport ≥ 480px |
| t12 | 32 | 42 | same |
| t13 | 40 | 52 | same |
| t14 | 48 | 60 | same |

Weights: `$font-weight.regular` 400, `$font-weight.medium` 500, `$font-weight.bold` 700. No other weights.

Text style names combine step and weight: `t4Medium`, `t5Bold`, `t6Regular`.

### 2.3 Semantic text styles

| name | definition | use |
|---|---|---|
| `screenTitle` | 26 / 35, bold | the main large title of a screen |
| `articleBody` | 16 / 24, regular | post body text |
| `articleNote` | 14 / 22, regular | notes and supplementary text in a post |

Source: https://seed-design.io/llms/foundations/typography.txt

---

## 3. Spacing, radius, shadow, layout

### 3.1 Spacing scale — `$dimension.*`

| x0_5 | x1 | x1_5 | x2 | x2_5 | x3 | x3_5 | x4 | x4_5 | x5 | x6 | x7 | x8 | x9 | x10 | x12 | x13 | x14 | x16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 52 | 56 | 64 |

Semantic spacing:

| token | value | use |
|---|---|---|
| `$dimension.spacing-x.global-gutter` | 16 | left/right screen padding |
| `$dimension.spacing-x.between-chips` | 8 | gap between chips |
| `$dimension.spacing-y.component-default` | 12 | default vertical gap between components |
| `$dimension.spacing-y.between-text` | 6 | gap between text blocks |
| `$dimension.spacing-y.nav-to-title` | 20 | gap between top navigation and screen title |
| `$dimension.spacing-y.screen-bottom` | 56 | bottom padding of a screen |

On devices with a safe area (notch, home indicator), measure spacing from the safe-area boundary, not the screen edge.

Source: https://seed-design.io/llms/foundations/spacing.txt

### 3.2 Radius — `$radius.*`

| r0_5 | r1 | r1_5 | r2 | r2_5 | r3 | r3_5 | r4 | r5 | r6 | full |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 20 | 24 | 9999 |

Concentric radius: for an element nested in a rounded container, `inner radius = outer radius − padding` (card radius 16 with padding 6 → inner radius 10).

Source: https://seed-design.io/llms/foundations/radius.txt

### 3.3 Shadow — `$shadow.*`

| token | Light | Dark |
|---|---|---|
| s1 | `0 1px 4px 0 #00000014` | `0 1px 4px 0 #00000080` |
| s2 | `0 2px 10px 0 #0000001a` | `0 2px 10px 0 #000000ad` |
| s3 | `0 4px 16px 0 #0000001f` | `0 4px 16px 0 #000000cc` |

Shadows are barely visible in dark theme. Use them only on a few high-attention elements such as the FAB.

### 3.4 Layout

- Breakpoints: `base` 0–479, `sm` 480–767, `md` 768–1279, `lg` 1280–1439, `xl` ≥ 1440.
- Mobile containers (bottom navigation, bottom sheet) have a max width of 480.

Source: https://seed-design.io/llms/foundations/layout.txt

---

## 4. Elevation

Express depth with **surface color first, then a stroke, then a shadow**. Keep shadows to a minimum.

| level | surface | examples |
|---|---|---|
| 0 | `$color.bg.layer-basement` | backdrop behind scrolling content |
| 1 | `$color.bg.layer-default` | page, card, list, top navigation |
| 2 | `$color.bg.layer-floating` | bottom sheet, menu sheet |
| 3 | topmost | alert dialog, always above everything |

- The top navigation stays fixed while content scrolls under it, but its level is not raised.
- The bottom navigation shows its depth with a stroke (top border), not a shadow.
- A snackbar always appears above the FAB.

Three ways to separate content:

| method | strength | use |
|---|---|---|
| Inset divider (1px line inset by the 16px gutter) | weak | items inside the same group |
| Full-width divider (1px line) | medium | between groups; to set off an action area |
| 8px gap | strong | content clearly different from what precedes it |

There is no 8px-thick divider. Build the 8px gap by placing `layer-default` blocks on a `layer-basement` backdrop with 8px between them.

Check whether a divider is needed at all: repeated layouts such as lists often separate naturally without one. Never put a divider after the last item or section.

Sources: https://seed-design.io/llms/foundations/elevation.txt · https://seed-design.io/llms/components/divider.txt

---

## 5. Motion and press feedback

### 5.1 Duration and easing

| `$duration.*` | d1 | d2 | d3 | d4 | d5 | d6 |
|---|---|---|---|---|---|---|
| ms | 50 | 100 | 150 | 200 | 250 | 300 |

`$duration.color-transition` = d3 (150ms). `$duration.pressed-scale` = d3 (150ms).

| `$timing-function.*` | value | use |
|---|---|---|
| `linear` | `cubic-bezier(0, 0, 1, 1)` | |
| `easing` | `cubic-bezier(0.35, 0, 0.35, 1)` | micro motion: button press, focus, color change |
| `enter` | `cubic-bezier(0, 0, 0.15, 1)` | dialogs and sheets appearing |
| `exit` | `cubic-bezier(0.35, 0, 1, 1)` | disappearing |
| `enter-expressive` | `cubic-bezier(0.03, 0.4, 0.1, 1)` | emphasized entrance (bottom sheet) |
| `exit-expressive` | `cubic-bezier(0.35, 0, 0.95, 0.55)` | emphasized exit |
| `pressed-scale` | `cubic-bezier(0, 0, 0.15, 1)` | press shrink |

Micro motion is ≤ 200ms; macro motion is > 200ms.

Source: https://seed-design.io/llms/foundations/motion.txt

### 5.2 Pressed state

1. **Color.** Change only the surface to its `-pressed` token. Text and icon colors never change on press. Elements without a background show a `$color.bg.transparent-pressed` layer while pressed (on a floating surface use `$color.bg.layer-floating-pressed`).
2. **Shrink.** While pressed the element shrinks by 2px of height. The scale factor is computed from the element size, not fixed:

   ```
   basis = max(height, width / 4, 24)
   scale = (basis - 2) / basis
   ```

   - 150ms, `cubic-bezier(0, 0, 0.15, 1)`, transform origin at the center, no layout shift of neighbors.
   - Buttons, chips and tabs shrink as a whole. Full-width elements such as list items keep their background still and shrink only the inner content.
   - Do not apply to inline text links or to Loading/Disabled states.
   - If the OS "reduce motion" setting is on, skip the shrink (scale 1) and change color only.
3. Elements whose color already encodes state (switch on/off, selected tab) do not change color on press; they only shrink.

Sources: https://seed-design.io/llms/foundations/feedback/color.txt · https://seed-design.io/llms/foundations/feedback/scale.txt

### 5.3 States

| state | rendering |
|---|---|
| Enabled | default |
| Pressed | `-pressed` surface color + shrink (5.2) |
| Selected | expressed by color; can combine with Pressed |
| Disabled | `$color.fg.disabled` / `$color.bg.disabled`; no press feedback |
| Loading | keeps the pressed color, shows progress, ignores further input |

Source: https://seed-design.io/llms/foundations/state.txt

---

## 6. Components

Numbers come from SEED's component spec JSON (`https://seed-design.io/rootage/components/{id}.json`); guidelines come from `https://seed-design.io/llms/components/{id}.txt`. The `id` is given in each heading.

### 6.1 Top Navigation — `top-navigation`

- Height 56, horizontal padding 6, background `$color.bg.layer-default`.
- Title: t6 bold (18/24), `$color.fg.neutral`. With a subtitle: title t5 bold, subtitle t2 regular `$color.fg.neutral-muted`.
- **Root type**: for top-level screens reached from the bottom tabs (for example the neighborhood name on Home). **Standard type**: for depth-2+ screens, with Back (`<`) or Close (`X`) on the left.
- Back returns to the previous screen. Close ends the current flow (compose, modal). Do not mix their meanings.
- Right side: 2 icon buttons recommended, 3 maximum; beyond that use a "more" button with a menu sheet. Only 1 text button.
- Fixed at the top while scrolling. By default no divider or shadow separates it from the content.
- Title is a single line, truncated with an ellipsis.

### 6.2 Bottom Navigation — `bottom-navigation`

SEED publishes no numeric spec for this component; only guidelines exist. Height and icon size must be decided in this project.

- Fixed at the bottom of root screens. **Maximum 5 tabs.**
- Each tab is a Fill-style icon plus a label. Selected state is shown by **color tone**, not by switching icon style. Do not mix Fill and Line icons.
- 1px top border (depth expressed by stroke).
- Inner container max width 480.
- Label ≤ 5 Korean characters (≤ 10 Latin characters). Labels do not follow OS font scaling.
- Notification badges on at most 2 tabs at once. Count shows 1–99, `99+` above, hidden at 0.

### 6.3 Action Button — `action-button`

Label is always bold. Color transition 150ms `easing`.

| size | min height | radius | padding x / y | icon | gap | label |
|---|---|---|---|---|---|---|
| xsmall | 32 | full | 14 / 6 | 14 | 4 | t3 |
| small | 36 | 8 | 14 / 8 | 14 | 4 | t4 |
| medium | 40 | 8 | 16 / 10 | 16 | 6 | t4 |
| large | 52 | 12 | 20 / 14 | 22 | 8 | t6 |

| variant | background | label | border | pressed background | use |
|---|---|---|---|---|---|
| `brandSolid` | `bg.brand-solid` | `fg.on-brand-solid` | – | `bg.brand-solid-pressed` | core actions (채팅하기, 글쓰기); one per screen |
| `neutralSolid` | `bg.neutral-solid` | `fg.on-neutral-solid` | – | `bg.neutral-solid-pressed` | CTA on most screens; one per screen |
| `criticalSolid` | `bg.critical-solid` | `fg.on-critical-solid` | – | `bg.critical-solid-pressed` | irreversible actions such as delete |
| `neutralWeak` | `bg.neutral-weak` | `fg.neutral` | – | `bg.neutral-weak-pressed` | most non-CTA actions |
| `brandOutline` | transparent | `fg.brand` | 1px `stroke.neutral-muted` | `bg.transparent-pressed` | low-emphasis secondary action |
| `neutralOutline` | transparent | `fg.neutral` | 1px `stroke.neutral-muted` | `bg.transparent-pressed` | lowest emphasis |
| `ghost` | transparent | `fg.neutral` | – | `bg.transparent-pressed` | text-like button |

- Disabled: Solid and Weak variants use `bg.disabled` + `fg.disabled`. Outline and Ghost keep their background and border and use `fg.disabled`.
- Outline variants are not used together with Solid variants; pair `brandOutline` with `neutralOutline`.
- When a dismiss button (`neutralWeak`: close, reset) sits next to a CTA, use a 3:7 width ratio. Never place 3 or more buttons side by side.
- Labels are action verbs: "시작하기" (Get started) rather than "다음" (Next). An icon goes before or after the label, not both.

### 6.4 Floating Action Button — `floating-action-button`

- Background `bg.brand-solid`, icon and label `fg.on-brand-solid`, radius full, shadow `$shadow.s3`, pressed `bg.brand-solid-pressed`.
- Icon only: 56 × 56, icon 24.
- Extended (icon + label): min height 48, padding 18 / 12, icon 16, gap 4, label t5 bold.
- Placed at the bottom right, 20 from the screen edge and 20 above any fixed bottom element (bottom navigation). One per screen. Its color cannot be changed.
- Extended form may hide its label on scroll down and show it again on scroll up (layout transition 200ms).
- If several choices are needed, use the Menu type: pressing opens a menu.

### 6.5 List Item / List Header — `list-item`, `list-header`

- Item: padding 16 horizontal / 12 vertical, no background of its own.
- Title t5 regular `fg.neutral`. Detail t3 regular `fg.neutral-subtle`. Gap between them 2.
- Prefix icon 22 `fg.neutral` (12 to its right). Suffix icon 18 `fg.neutral-subtle`. Suffix text t5 regular `fg.neutral-subtle`.
- Pressed: a `bg.transparent-pressed` layer inset 6 from each side with radius 10; only the content shrinks.
- Highlighted (new notification, update): background `bg.brand-weak`, pressed `bg.brand-weak-pressed`.
- Disabled: `fg.disabled`.
- Header: padding 16 horizontal / 8 vertical, t4. Variants `mediumWeak` (medium, `fg.neutral-subtle`) and `boldSolid` (bold, `fg.neutral`).
- Never make horizontal padding narrower than 16. Do not put 4 or more interactive elements in one item.
- If the item holds a switch, checkbox or radio, the whole row is the tap target.

### 6.6 Chip — `chip`

- Radius full, label t4 medium. Height: small 32, medium 36, large 40.
- `solid`: background `bg.neutral-weak-alpha`; selected → `bg.neutral-solid` + `fg.on-neutral-solid`.
- `outlineStrong`: 1px `stroke.neutral-muted`; selected → `bg.neutral-solid` + `fg.on-neutral-solid`.
- `outlineWeak`: 1px `stroke.neutral-muted`; selected → border `stroke.neutral-contrast` + background `bg.neutral-weak`.
- Disabled: opacity 0.5. Gap between chips 8.
- A button triggers an action; a chip shows a selection or a filter condition. Where many chips can be selected at once, prefer `outlineWeak`.
- A chip group is either one horizontally scrollable row or a wrapping layout.

### 6.7 Tabs — `tablist`, `tab`

- Tab list: background `bg.layer-default`, 1px bottom border `stroke.neutral-muted`, selection indicator 2 high in `fg.neutral`, moving in 200ms `easing`.
- Tab: medium height 44 with t5 bold; small height 40 with t4 bold; padding 10.
- Label color: unselected `fg.neutral-subtle`, selected `fg.neutral`, disabled `fg.disabled`.

### 6.8 Badge / Notification Badge — `badge`, `notification-badge`

- Badge large: min height 24, padding 8 / 4, radius 6, t2. Badge medium: min height 20, padding 6 / 2, radius 4, t1.
- Badge variants, for tones neutral / brand / informative / positive / warning / critical:
  - `weak`: `bg.{tone}-weak` + `fg.{tone}-contrast`, medium weight (neutral: `bg.neutral-weak` + `fg.neutral-muted`)
  - `solid`: `bg.{tone}-solid` + `fg.on-{tone}-solid`, bold
  - `outline`: 1px `stroke.{tone}-weak` + `fg.{tone}`, bold (neutral: `stroke.neutral-muted` + `fg.neutral-muted`)
- Notification Badge: `bg.brand-solid` + `fg.on-brand-solid`. Large: min 18 × 18, horizontal padding 4, radius full, 11px bold with no font scaling. Small: 6px dot.

### 6.9 Manner Temp / Manner Temp Badge — `manner-temp`, `manner-temp-badge`

- Manner Temp: temperature number in t5 bold, colored with the level's text color (1.5), plus a 32px face emote, gap 4.
- Manner Temp Badge: min height 20, padding 6 / 2, radius full, t1 bold, level bg + text colors.
- Use Manner Temp where the temperature is key information (seller info on a post detail, profile). Use the badge in small areas next to other summary info.

### 6.10 Text Input — `text-input`

- Outline large: min height 52, radius 12, horizontal padding 16, t5. Outline medium: min height 40, radius 8, horizontal padding 14, t4.
- Border: default 1px `stroke.neutral-weak` → focused 2px `stroke.neutral-contrast` → invalid 2px `stroke.critical-solid`.
- Value `fg.neutral`, placeholder `fg.placeholder`. Disabled and read-only background `bg.disabled`.
- Multiline min height: large 94, medium 82.

### 6.11 Search Bar — `search-bar`

- Search input combined with Back and Close. Placed alone and fixed at the very top of the screen, not together with a Top Navigation.
- Back goes to the previous step. Close leaves the search screen entirely.
- Show a clear button when there is text; keep focus after clearing.

### 6.12 Bottom Sheet — `bottom-sheet`

- Backdrop `bg.overlay`. Sheet background `bg.layer-floating`, top radius 24, max width 480, max height 90% of the screen.
- Header padding top 24 / bottom 16. Title t8 bold `fg.neutral`. Description t5 regular `fg.neutral-muted`.
- Body horizontal padding 16. Footer padding top 12 / bottom 16.
- Enter 300ms `enter-expressive`; exit 200ms `exit`.

### 6.13 Snackbar — `snackbar`

- Background `bg.neutral-solid`, radius 8, min height 44, max width 464, padding 10, 8 from the screen edges.
- Message t4 regular `fg.on-neutral-solid`. Action t4 bold `fg.brand`.
- Enter 150ms (opacity 0 → 1, scale 0.8 → 1); exit 100ms.

### 6.14 Avatar / Divider — `avatar`, `divider`

- Avatar: circle with a 1px `stroke.neutral-subtle` border. Sizes 20, 24, 36, 42, 48, 56, 64, 80, 96, 108.
- Divider: 1px. `stroke.neutral-muted` for section boundaries that appear once or twice per screen; `stroke.neutral-subtle` between repeated rows.

---

## 7. Icons

- Use Karrot's icon set: thick strokes, simple rounded shapes, about 300 monochrome and multicolor icons. Library: https://seed-design.io/foundations/iconography/library
- Do not mix Fill and Line styles in one context. Bottom tabs use Fill.

---

## 8. Not covered here

- Bottom navigation height and icon size (not published by SEED).
- Temperature ranges for the manner-temp levels.
- Layouts of Karrot-specific screens and items such as the product card and feed row. SEED documents shared components only; screen composition has to be designed in this project.
- Components not listed above (Alert Dialog, Checkbox, Switch, Select, Menu Sheet, …). See the component index below.

---

## 9. Sources

SEED documentation is Korean. These are the originals this file was built from.

- Index: https://seed-design.io/llms.txt
- Foundations index: https://seed-design.io/foundations/llms.txt
- Components index: https://seed-design.io/components/llms.txt
- Full token list: https://seed-design.io/llms/foundations/design-token/reference.txt
- Individual documents: `https://seed-design.io/llms/{foundations|components}/{name}.txt`
- Component numeric specs: `https://seed-design.io/rootage/components/{id}.json`
- Repository: https://github.com/daangn/seed-design
