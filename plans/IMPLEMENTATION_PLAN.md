# Prayer Streaks — Implementation Plan

## Overview

Prayer Streaks is an offline-first NativeScript Angular app that helps users build
a daily prayer habit by tracking check-ins and streaks. This document lays out the
full implementation plan: project structure, navigation architecture, data layer,
UI screens, and platform-specific details.

**Key references:**

- [NativeScript TabView docs](https://docs.nativescript.org/ui/tab-view)
- [TabView `iconSource`](https://docs.nativescript.org/ui/tab-view#iconsource)
- [Google Material Icons (font)](https://fonts.google.com/icons)
- [Nathan Walker's ultimate tab setup (feat/tabview branch)](https://github.com/NathanWalker/ns-ultimate-tab-setup/blob/feat/tabview/src/app/features/home/home.component.html)

---

## 1. Navigation — Bottom Tab Bar with Liquid Glass (iOS)

### 1.1 Tab definitions

The app uses **three bottom tabs** (minimum two required; three gives room for
growth):

| # | Tab title  | iOS icon (SFSymbol)    | Android icon (Material Icons `font://`) | Purpose                            |
|---|-----------|------------------------|------------------------------------------|------------------------------------|
| 1 | Today     | `sys://checkmark.seal.fill` | `font://\ue86c` (check_circle)     | Daily check-in & current streak    |
| 2 | History   | `sys://calendar`       | `font://\ue889` (history)               | Past check-ins & streak calendar   |
| 3 | Settings  | `sys://gear`           | `font://\ue8b8` (settings)              | Prayer types, preferences, about   |

### 1.2 TabView template (Angular)

Following the pattern from [Nathan Walker's sample](https://github.com/NathanWalker/ns-ultimate-tab-setup/blob/feat/tabview/src/app/features/home/home.component.html),
the root home component template will look like:

```html
<GridLayout rows="*, auto" class="bg-transparent" (loaded)="loadedHome($event)">
  <TabView
    rowSpan="2"
    (selectedIndexChange)="selectedIndexChange($event)"
    (loaded)="loadedTabs($event)"
    swipeEnabled="false"
    class="app-background"
    androidTabsPosition="bottom"
    tabTextFontSize="11"
    iosTabBarMinimizeBehavior="onScrollDown"
  >
    <!-- Tab 1 — Today -->
    <GridLayout
      *tabItem="{
        title: 'Today',
        textTransform: 'capitalize',
        iconSource: isIOS ? 'sys://checkmark.seal.fill' : 'font://\ue86c'
      }"
    >
      <page-router-outlet
        actionBarVisibility="never"
        name="todayTab"
      ></page-router-outlet>
    </GridLayout>

    <!-- Tab 2 — History -->
    <GridLayout
      *tabItem="{
        title: 'History',
        textTransform: 'capitalize',
        iconSource: isIOS ? 'sys://calendar' : 'font://\ue889'
      }"
    >
      <page-router-outlet
        actionBarVisibility="never"
        name="historyTab"
      ></page-router-outlet>
    </GridLayout>

    <!-- Tab 3 — Settings -->
    <GridLayout
      *tabItem="{
        title: 'Settings',
        textTransform: 'capitalize',
        iconSource: isIOS ? 'sys://gear' : 'font://\ue8b8'
      }"
    >
      <page-router-outlet
        actionBarVisibility="never"
        name="settingsTab"
      ></page-router-outlet>
    </GridLayout>
  </TabView>
</GridLayout>
```

### 1.3 Platform detection in component

```typescript
import { isIOS } from '@nativescript/core';

export class HomeComponent {
  isIOS = isIOS;

  loadedHome(args) { /* lifecycle hook */ }
  loadedTabs(args) { /* lifecycle hook */ }
  selectedIndexChange(args) { /* handle tab change */ }
}
```

### 1.4 iOS Liquid Glass

NativeScript 9 on **iOS 26+** wraps `UITabBarController` natively, which
automatically renders the system "liquid glass" (frosted/translucent) tab bar
when the app is compiled against the iOS 26 SDK. No extra code is needed beyond:

- Using `<TabView>` (maps to `UITabBarController` on iOS).
- Setting `iosTabBarMinimizeBehavior="onScrollDown"` so the glass bar collapses
  on scroll, matching the native iOS 26 behavior.
- Keeping the background transparent / using `class="bg-transparent"` on the
  parent `GridLayout` so the blur shows through.

The `iosBottomAccessory` property is available if we later want to attach a
mini-player-style view above the tab bar.

### 1.5 Android Material Icons font setup

1. **Download** `MaterialIcons-Regular.ttf` from
   [Google Fonts — Material Icons](https://fonts.google.com/icons).
2. **Place** the file at `src/fonts/MaterialIcons-Regular.ttf`.
   NativeScript auto-discovers fonts in this folder.
3. **Register** the font family in `src/app.css`:

   ```css
   .material-icons {
     font-family: "MaterialIcons-Regular", "materialicons-regular";
   }
   ```

4. The `font://` prefix in `iconSource` tells NativeScript to render the
   character using the font registered on the TabView. Add a CSS rule to target
   the TabView on Android:

   ```css
   TabView {
     font-family: "MaterialIcons-Regular", "materialicons-regular";
   }
   ```

   This ensures the Unicode codepoints (`\ue86c`, `\ue889`, `\ue8b8`) resolve
   to the correct Material Icon glyphs.

---

## 2. Project Structure

```
src/
├── app/
│   ├── app.component.ts              ← root component (just a router outlet)
│   ├── app.component.html
│   ├── app.routes.ts                 ← top-level route config
│   │
│   ├── features/
│   │   ├── home/
│   │   │   ├── home.component.ts     ← TabView host (bottom tabs)
│   │   │   └── home.component.html   ← TabView template
│   │   │
│   │   ├── today/
│   │   │   ├── today.component.ts    ← check-in screen
│   │   │   └── today.component.html
│   │   │
│   │   ├── history/
│   │   │   ├── history.component.ts  ← streak history / calendar
│   │   │   └── history.component.html
│   │   │
│   │   └── settings/
│   │       ├── settings.component.ts ← preferences, prayer types
│   │       └── settings.component.html
│   │
│   └── core/
│       ├── models/
│       │   └── checkin.model.ts      ← CheckIn interface
│       ├── services/
│       │   ├── checkin.service.ts     ← check-in CRUD + streak logic
│       │   └── storage.service.ts    ← ApplicationSettings wrapper
│       └── utils/
│           └── date.utils.ts         ← date helpers (streak calc, formatting)
│
├── fonts/
│   └── MaterialIcons-Regular.ttf     ← Android tab icons
│
├── app.css                           ← global styles + Tailwind + font registration
├── main.ts
└── polyfills.ts
```

The existing `src/app/people/` folder (scaffold demo) will be **removed** once
the new features are in place.

---

## 3. Routing

### 3.1 Top-level routes (`app.routes.ts`)

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,   // TabView host
    children: [
      // Named outlets for each tab
      { path: 'today',    component: TodayComponent,    outlet: 'todayTab' },
      { path: 'history',  component: HistoryComponent,  outlet: 'historyTab' },
      { path: 'settings', component: SettingsComponent, outlet: 'settingsTab' },
    ],
  },
];
```

Each `page-router-outlet` in the TabView template has a `name` that matches
these outlet names, allowing independent navigation stacks per tab.

---

## 4. Data Model

### 4.1 CheckIn interface

```typescript
export interface CheckIn {
  /** ISO 8601 date string (YYYY-MM-DD) — one per day max */
  date: string;
  /** Optional prayer type tag */
  prayerType?: PrayerType;
  /** Timestamp of the actual check-in */
  checkedInAt: number;
}

export type PrayerType = 'scripture' | 'devotional' | 'intercession' | 'worship' | 'other';
```

### 4.2 Storage (offline-first)

All data lives in **`ApplicationSettings`** (NativeScript's built-in key-value
store, backed by `NSUserDefaults` on iOS and `SharedPreferences` on Android).

| Key                  | Type       | Description                        |
|----------------------|------------|------------------------------------|
| `checkins`           | `string`   | JSON array of `CheckIn` objects    |
| `prayerTypes`        | `string`   | JSON array of custom prayer types  |
| `lastStreakDate`     | `string`   | ISO date of last streak calc       |

A thin `StorageService` wraps `ApplicationSettings` to provide typed
get/set helpers with JSON serialization.

---

## 5. Core Service — `CheckInService`

| Method                        | Returns             | Description                                   |
|-------------------------------|---------------------|-----------------------------------------------|
| `checkIn(type?: PrayerType)`  | `void`              | Records today's check-in (idempotent per day) |
| `hasCheckedInToday()`         | `boolean`           | Whether the user already checked in today     |
| `getCurrentStreak()`          | `number`            | Consecutive days including today              |
| `getLongestStreak()`          | `number`            | All-time longest streak                       |
| `getHistory(limit?: number)`  | `CheckIn[]`         | Recent check-ins, newest first                |
| `getAllCheckIns()`            | `CheckIn[]`         | Full history                                  |

### Streak calculation logic

1. Sort check-ins by date descending.
2. Starting from today (or yesterday if not yet checked in), walk backwards.
3. Each consecutive day increments the streak counter.
4. A gap of ≥ 1 day breaks the streak.

---

## 6. Screen-by-Screen UI Plan

### 6.1 Today tab (check-in)

```
┌──────────────────────────┐
│      Prayer Streaks      │  ← large title (ActionBar)
│                          │
│   🔥 12-day streak!     │  ← streak count, prominent
│                          │
│  ┌──────────────────┐    │
│  │  I Prayed Today  │    │  ← primary action button
│  └──────────────────┘    │
│                          │
│  Prayer type (optional): │
│  [Scripture] [Devotional]      │  ← tag chips / SegmentedBar
│  [Intercession] [Worship]     │
│                          │
│  ✅ Checked in today     │  ← confirmation (after tap)
│                          │
└──────────────────────────┘
```

**Behavior:**
- On load, check `hasCheckedInToday()`. If true, show the confirmation state
  with a green checkmark and disable the button.
- Tapping "I Prayed Today" calls `checkIn(selectedType)`.
- The streak counter updates reactively via Angular signals.
- The prayer-type selector is optional; defaults to `undefined` if skipped.

### 6.2 History tab

```
┌──────────────────────────┐
│        History           │  ← large title
│                          │
│  Current streak:  12     │
│  Longest streak:  30     │
│                          │
│  ── February 2026 ────── │  ← month header
│  Feb 17  ✅  Scripture     │
│  Feb 16  ✅  Devotional   │
│  Feb 15  ✅  Intercession │
│  Feb 14  ✅               │
│  Feb 13  ❌  (missed)     │
│  Feb 12  ✅  Worship      │
│  ...                     │
│                          │
└──────────────────────────┘
```

**Behavior:**
- `ListView` showing check-in history grouped by month.
- Each row shows the date, a check/cross indicator, and the optional prayer type.
- Stats bar at top with current & longest streak.
- Scrollable; the iOS glass tab bar minimizes on scroll down
  (`iosTabBarMinimizeBehavior="onScrollDown"`).

### 6.3 Settings tab

```
┌──────────────────────────┐
│       Settings           │  ← large title
│                          │
│  Prayer Types            │
│  ┌────────────────────┐  │
│  │ ☑ Scripture        │  │
│  │ ☑ Devotional       │  │
│  │ ☑ Intercession     │  │
│  │ ☑ Worship          │  │
│  │ + Add custom...    │  │
│  └────────────────────┘  │
│                          │
│  App Info                │
│  ┌────────────────────┐  │
│  │ Version   1.0.0    │  │
│  │ Build     42       │  │
│  └────────────────────┘  │
│                          │
│  [ Reset All Data ]      │  ← danger button
│                          │
└──────────────────────────┘
```

**Behavior:**
- Toggle prayer types on/off to control which chips show on the Today tab.
- "Add custom" opens a prompt dialog to add a new prayer type.
- "Reset All Data" shows a confirm dialog, then clears all `ApplicationSettings`.
- Version / build info pulled from app config.

---

## 7. Styling

### 7.1 Global styles (`app.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Material Icons font for Android tab bar */
TabView {
  font-family: "MaterialIcons-Regular", "materialicons-regular";
}

/* Tab bar theming */
.tab-view {
  tab-text-color: #8e8e93;
  tab-background-color: transparent;
}
```

### 7.2 Tailwind usage

The project already has `@nativescript/tailwind` configured. We use Tailwind
utility classes throughout templates for spacing, typography, and color:

- `text-3xl`, `font-bold` for streak numbers
- `p-4`, `m-2` for spacing
- `bg-white`, `bg-gray-100`, `rounded-xl` for cards
- Dark mode via `.ns-dark` class (already configured in `tailwind.config.js`)

---

## 8. Implementation Phases

### Phase 1 — Scaffold & Navigation

1. Remove the existing `src/app/people/` demo folder.
2. Create the `src/app/features/home/` component with the TabView template.
3. Create stub components for `today/`, `history/`, and `settings/`.
4. Set up routing with named outlets.
5. Download `MaterialIcons-Regular.ttf` and place in `src/fonts/`.
6. Register the font in `app.css`.
7. Wire up `app.component` → `HomeComponent` → tab outlets.
8. Verify tabs render on both iOS and Android with correct icons.

### Phase 2 — Data Layer

1. Create `CheckIn` model and `PrayerType` type.
2. Implement `StorageService` wrapping `ApplicationSettings`.
3. Implement `CheckInService` with all methods.
4. Write streak calculation logic with unit-testable pure functions in
   `date.utils.ts`.

### Phase 3 — Today Tab

1. Build the check-in UI with streak display.
2. Wire up the "I Prayed Today" button to `CheckInService.checkIn()`.
3. Add prayer-type chip selector (optional tagging).
4. Show confirmation state when already checked in.
5. Use Angular signals for reactive streak count.

### Phase 4 — History Tab

1. Build the history list UI with `ListView`.
2. Group entries by month.
3. Show streak stats at the top.
4. Display check/miss indicators and prayer type labels.

### Phase 5 — Settings Tab

1. Build prayer-type management (toggle, add custom).
2. Add app info section.
3. Add "Reset All Data" with confirm dialog.

### Phase 6 — Polish

1. Dark mode support (`.ns-dark` class).
2. Confirm liquid glass renders correctly on iOS 26+.
3. Test `iosTabBarMinimizeBehavior="onScrollDown"` with scrollable History list.
4. Ensure Android Material Icons render properly in tab bar.
5. Final Tailwind styling pass for consistent spacing and typography.

---

## 9. Dependencies

All required packages are **already in `package.json`**:

| Package                  | Version    | Purpose                             |
|--------------------------|------------|-------------------------------------|
| `@nativescript/core`     | `~9.0.0`  | TabView, ApplicationSettings, isIOS |
| `@nativescript/angular`  | `^20.0.0` | Angular integration, router outlets |
| `@angular/router`        | `~20.2.0` | Named outlets, child routes         |
| `@nativescript/tailwind` | `^2.1.0`  | Utility-first CSS                   |

**No additional npm packages are required.** The only new asset is the Material
Icons font file for Android.

---

## 10. Key Technical Decisions

| Decision                       | Rationale                                         |
|--------------------------------|---------------------------------------------------|
| `ApplicationSettings` for data | Offline-first, zero dependencies, instant access   |
| Angular signals (not RxJS)     | Already used in scaffold; simpler reactive model   |
| Named `page-router-outlet`     | Independent nav stacks per tab (NativeScript way)  |
| `TabView` (not `Tabs`)        | NativeScript 9 recommended; native iOS 26 support  |
| SFSymbols + Material Icons     | Platform-native look on each OS; single font file  |
| Tailwind CSS                   | Already configured; rapid UI iteration             |

---

## 11. File Checklist

Files to **create**:

- [x] `src/fonts/MaterialIcons-Regular.ttf`
- [x] `src/app/features/home/home.component.ts`
- [x] `src/app/features/home/home.component.html`
- [x] `src/app/features/today/today.component.ts`
- [x] `src/app/features/today/today.component.html`
- [x] `src/app/features/history/history.component.ts`
- [x] `src/app/features/history/history.component.html`
- [x] `src/app/features/settings/settings.component.ts`
- [x] `src/app/features/settings/settings.component.html`
- [x] `src/app/core/models/checkin.model.ts`
- [x] `src/app/core/services/checkin.service.ts`
- [x] `src/app/core/services/storage.service.ts`
- [x] `src/app/core/utils/date.utils.ts`

Files to **modify**:

- [x] `src/app/app.routes.ts` — replace demo routes with tab routes
- [x] `src/app/app.component.ts` — no changes needed (already correct)
- [x] `src/app/app.component.html` — no changes needed (single `page-router-outlet`)
- [x] `src/app.css` — add font registration + tab bar styles

Files to **remove**:

- [x] `src/app/people/` — entire demo folder
