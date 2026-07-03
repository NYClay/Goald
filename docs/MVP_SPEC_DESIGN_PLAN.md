# Goald — MVP Spec, Design & Implementation Plan

## Status: Pre-MVP Audit

The app is surprisingly **feature-complete** — every screen, service, hook, and component exists and
works. However, it feels like finance software, not a cozy game. The MVP work is about
**transformation, not features**: making the existing scope feel cohesive, polished, and emotionally
aligned with "a cozy game where saving money upgrades your life."

---

## 1. MVP SPECIFICATION

### 1.1 MVP Core Identity

| Attribute | MVP Target |
|-----------|------------|
| Feeling | A cozy game where saving money upgrades your life |
| NOT | A bank app, spreadsheet, or budgeting tool |
| Emotion | Warm, rewarding, low-pressure, celebratory |
| Primary action | Making a deposit and watching your scene build |
| Success metric | User returns to make ≥3 deposits in their first month |

### 1.2 MVP Scope: IN

- Email/password auth (register, login, logout, password reset)
- Goal CRUD (create, read, update, delete with cascade)
- Deposit tracking (add, list, search by amount/note/date)
- Visual progress animation (5 themes, 11 stages each, continuous reveal)
- Dashboard (goal list, filter/sort, portfolio snapshot)
- Badges (6 badges, earned state, grid display)
- Celebration screen on goal completion (confetti + trophy)
- Deposit streak tracking (monthly, displayed on Dashboard)
- Toast notifications (success/error/info feedback)
- Sidebar quick nav on goal workflow screens
- 24-month growth projection on goal detail
- E2E deterministic test mode (in-memory store)
- Design system (theme, tokens, typography, spacing — NEW)
- Cozy visual polish across all screens (NEW)

### 1.3 MVP Scope: OUT (Post-MVP)

| Feature | Why Out |
|---------|---------|
| Push notifications | Not core to "cozy game" loop; user returns for visual reward |
| Premium themes / monetization | Not needed for MVP validation |
| Lottie animations | Dead dependency; pixel-art views work. Remove or defer |
| MFA / advanced auth | Not needed at MVP scale |
| Admin panel | Operational need, not product need |
| Dark mode | Scope increase; light mode only |
| Social features / sharing | Not core |
| Scheduled/auto-deposits | Not core; manual deposits are the engagement loop |
| Multi-currency | Not core |
| Data export | Post-MVP |
| Accessibility deep audit | Minimum a11y exists (labels); full audit is post-MVP |

### 1.4 Definition of Done for MVP

- ✅ All screens feel visually cohesive (design system applied)
- ✅ The emotional tone is "cozy game" not "finance app" (validated by user test)
- ✅ Auth flow works end-to-end (register → dashboard)
- ✅ Goal CRUD works without errors
- ✅ Deposits update balance + animation in real-time
- ✅ Badges earn correctly
- ✅ All 5 animation themes render correctly at all progress stages
- ✅ App renders on web (Expo Web) and iOS/Android
- ✅ E2E smoke tests pass
- ✅ Unit test coverage ≥60% on `src/utils/`
- ✅ Unit test coverage ≥40% on `src/services/`
- ✅ No `any` types, no layer violations (ESLint passes)
- ✅ CI pipeline runs lint + typecheck + tests
- ✅ `src/types/index.ts` exists with all shared types
- ✅ `lottie-react-native` removed (not imported anywhere)

---

## 2. DESIGN SYSTEM — "Cozy Game" Visual Identity

### 2.1 Principles

```
Warm      →  No pure white (#FFF). No harsh blacks.
Playful   →  Rounded corners, soft shadows, emoji as icons.
Rewarding →  Every interaction gives a visible treat.
Low-pressure →  Gentle tones, no red alert colors.
```

### 2.2 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bg.cream` | `#FDF6EE` | Main screen backgrounds (replaces `#F0FFF0`) |
| `bg.warm` | `#FAF3EA` | Card surfaces (replaces `#FFFFFF`) |
| `bg.card` | `#FFF9F0` | Elevated cards, inputs |
| `accent.moss` | `#5B8C5A` | Primary buttons, active states (replaces `#4CAF50`) |
| `accent.leaf` | `#7CB46B` | Progress bars, secondary accent |
| `accent.gold` | `#E8B84B` | Completion, celebration, premium |
| `accent.coral` | `#E8755A` | Streak, warnings (warm, not alarming) |
| `text.primary` | `#2C1810` | Headings, body |
| `text.secondary` | `#6B5E54` | Labels, subtitles |
| `text.muted` | `#9C8E82` | Placeholders, hints |
| `border.soft` | `#E6DDD3` | Borders, dividers (replaces `#DDD`) |
| `state.error` | `#C44A4A` | Errors (warm red, not alarm red) |

**Rationale**: Moving from green-on-white finance aesthetic to warm earthy tones. The green
family stays but shifts warmer. Cream backgrounds replace bright white. Coral replaces harsh red.

### 2.3 Typography

- **Headings**: `Inter`, weight 800, tight tracking
- **Body**: `Inter`, weight 400/600
- **Monetary amounts**: `JetBrains Mono` (or system monospace for simplicity)
- **Scale**: 10 / 12 / 14 / 16 / 18 / 24 / 28 / 36

### 2.4 Spacing Scale

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`

### 2.5 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius.sm` | 8 | Inputs, small cards |
| `radius.md` | 12 | Cards, modals |
| `radius.lg` | 16 | Large cards, scenes |
| `radius.full` | 999 | Chips, avatars |

### 2.6 Shadow

Soft, warm shadows (not drop shadows):
```
shadowColor: '#3D2E1E',
shadowOpacity: 0.06,
shadowOffset: { width: 0, height: 4 },
shadowRadius: 12,
elevation: 3,
```

### 2.7 Design Tokens File

All tokens go in `src/config/theme.ts`. Every component imports from here.
No hardcoded colors anywhere after the migration.

```typescript
// src/config/theme.ts (new file)
export const colors = {
  bg: { cream: '#FDF6EE', warm: '#FAF3EA', card: '#FFF9F0' },
  accent: { moss: '#5B8C5A', leaf: '#7CB46B', gold: '#E8B84B', coral: '#E8755A' },
  text: { primary: '#2C1810', secondary: '#6B5E54', muted: '#9C8E82' },
  border: { soft: '#E6DDD3' },
  state: { error: '#C44A4A', success: '#5B8C5A' },
};
export const spacing = (n: number) => [0, 4, 8, 12, 16, 20, 24, 32, 40, 48][n] ?? n * 4;
export const radius = { sm: 8, md: 12, lg: 16, full: 999 };
export const typography = { /* ... */ };
```

---

## 3. IMPLEMENTATION PLAN

### Phase 0: Foundation (Week 1)

**Goal**: Clean up architecture debt so the design system can land cleanly.

| # | Task | Files | Depends On |
|---|------|-------|------------|
| 0.1 | Create `src/types/index.ts` with `Goal`, `Deposit`, `UserStats`, `BadgeId` | New file | — |
| 0.2 | Remove inline type defs from `goalService.ts`, `depositService.ts`, `useStreak.ts`, `badges.ts` | 4 files | 0.1 |
| 0.3 | Extract deposit streak/badge logic from `DepositScreen.tsx` into `src/utils/depositUtils.ts` | `DepositScreen.tsx`, new `depositUtils.ts` | — |
| 0.4 | Fix layer violation: remove direct `firebase/firestore` import from `DepositScreen.tsx`, route through `useStreak` hook + service | `DepositScreen.tsx`, `useStreak.ts`, `authService.ts` | 0.3 |
| 0.5 | Remove unused `lottie-react-native` from `package.json` | `package.json` | — |
| 0.6 | Create `src/config/featureFlags.ts` | New file | — |
| 0.7 | Audit ESLint for layer-import rules and fix all violations | All files | 0.1-0.6 |

**Exit criteria**: `npm run typecheck && npm run lint` passes. No inline types remain.

---

### Phase 1: Design System (Week 2)

**Goal**: Make the app feel like a cozy game.

| # | Task | Files | Depends On |
|---|------|-------|------------|
| 1.1 | Create `src/config/theme.ts` with colors, spacing, radius, typography tokens | New file | Phase 0 |
| 1.2 | Apply theme tokens to `AppButton.tsx` | 1 component | 1.1 |
| 1.3 | Apply theme tokens to `ProgressBar.tsx` | 1 component | 1.1 |
| 1.4 | Apply theme tokens to `GoalCard.tsx` | 1 component | 1.1 |
| 1.5 | Apply theme tokens to `BadgeItem.tsx` | 1 component | 1.1 |
| 1.6 | Apply theme tokens to `ThemeSelector.tsx` | 1 component | 1.1 |
| 1.7 | Apply theme tokens to `SidebarNav.tsx` | 1 component | 1.1 |
| 1.8 | Apply theme tokens to `ToastHost.tsx` | 1 component | 1.1 |
| 1.9 | Apply theme tokens to `LandingScreen.tsx` | 1 screen | 1.1 |
| 1.10 | Apply theme tokens to `LoginScreen.tsx` | 1 screen | 1.1 |
| 1.11 | Apply theme tokens to `RegisterScreen.tsx` | 1 screen | 1.1 |
| 1.12 | Apply theme tokens to `DashboardScreen.tsx` | 1 screen | 1.1 |
| 1.13 | Apply theme tokens to `CreateGoalScreen.tsx` | 1 screen | 1.1 |
| 1.14 | Apply theme tokens to `GoalDetailScreen.tsx` | 1 screen | 1.1 |
| 1.15 | Apply theme tokens to `EditGoalScreen.tsx` | 1 screen | 1.1 |
| 1.16 | Apply theme tokens to `DepositScreen.tsx` | 1 screen | 1.1 |
| 1.17 | Apply theme tokens to `CelebrationScreen.tsx` | 1 screen | 1.1 |
| 1.18 | Apply theme tokens to `BadgesScreen.tsx` | 1 screen | 1.1 |
| 1.19 | Apply theme tokens to `MilestoneAnimation.tsx` | 1 component | 1.1 |
| 1.20 | Apply theme tokens to `AppNavigator.tsx` + `AppTabs.tsx` | 2 nav files | 1.1 |
| 1.21 | Verify visual consistency — walk every screen, fix color drift | All | 1.2-1.20 |

**Exit criteria**: No hardcoded color strings remain outside `theme.ts`. All screens use theme tokens.

---

### Phase 2: Visual Polish & Cozy Touches (Week 3)

**Goal**: Delightful, emotionally resonant interactions.

| # | Task | Details |
|---|------|---------|
| 2.1 | Softer loading states | Replace `ActivityIndicator` with warm skeleton placeholders (pulsing card shapes) |
| 2.2 | Deposit confirmation micro-interaction | On deposit success, show brief animated checkmark + "+$X" float-up before navigating back |
| 2.3 | Empty states redesign | Replace generic empty states with cozy illustrations (a sleeping plant, a blank canvas) and encouraging copy |
| 2.4 | Goal creation flow warmth | Add friendly copy at top: "What are you saving for?" instead of "Goal Name" |
| 2.5 | Streak display upgrade | Show streak as a small campfire or plant that grows, not just "🔥 X-month streak" |
| 2.6 | Milestone animation polish | Add subtle particle/sparkle effects at milestone boundaries (25/50/75/100%) |
| 2.7 | Dashboard portfolio card | Redesign as a "Progress Garden" card — visual overview, not spreadsheet rows |
| 2.8 | Celebration screen upgrade | Add goal theme emoji, more varied confetti, softer animations |
| 2.9 | Bottom tab bar restyle | Warm background, rounded top corners, soft active indicator |
| 2.10 | Landing page refresh | Bigger hero visual, warmer copy, less "sign up" pressure, more "start your adventure" |

**Exit criteria**: User test shows 3/3 participants describe app as "cozy," "game-like," or "rewarding."

---

### Phase 3: Testing (Week 4)

**Goal**: Confidence to ship without regressions.

| # | Task | Files |
|---|------|-------|
| 3.1 | Unit tests for `src/utils/badges.ts` — `computeEarnedBadges` edge cases | New test file |
| 3.2 | Unit tests for `src/utils/format.ts` — currency, whole number, parsing | New test file |
| 3.3 | Unit tests for `src/utils/depositUtils.ts` (from 0.3) | New test file |
| 3.4 | Unit tests for `src/services/goalService.ts` — CRUD in E2E mode | New test file |
| 3.5 | Unit tests for `src/services/depositService.ts` — add + subscribe in E2E mode | New test file |
| 3.6 | Unit tests for `src/services/authService.ts` — register/login/logout in E2E mode | New test file |
| 3.7 | Component test for `AppButton` — renders variants, loading, pressed states | New test file |
| 3.8 | Component test for `ProgressBar` — renders at 0/25/50/75/100% | New test file |
| 3.9 | Component test for `MilestoneAnimation` — renders all 5 themes at 0/50/100% | New test file |
| 3.10 | E2E: Add scenario for goal completion → celebration screen | Feature file |
| 3.11 | E2E: Add scenario for badge earning flow | Feature file |
| 3.12 | E2E: Add scenario for streak incrementing | Feature file |
| 3.13 | E2E: Add scenario for empty states rendering | Feature file |

**Exit criteria**: `npm run test:unit && npm run test:e2e` passes. Coverage ≥60% on utils, ≥40% on services.

---

### Phase 4: Release Readiness (Week 5)

**Goal**: Ship to real users.

**Current state**: CI workflows already exist (`.github/workflows/ci-quality.yml` + `e2e-bdd.yml`).
Lint + typecheck + E2E run on push/PR. CI needs a unit-test step added.

| # | Task | Details |
|---|------|---------|
| 4.1 | CI: Add unit test step | Add `npm run test:unit` to `ci-quality.yml` |
| 4.2 | Fix lint warnings | Fix 2 `react-hooks/exhaustive-deps` warnings in `CelebrationScreen.tsx` |
| 4.3 | Error boundary | Wrap app in React error boundary that shows cozy fallback + "try again" |
| 4.4 | Network state handling | Detect offline — show cozy "no signal" banner, queue deposit for retry? |
| 4.5 | Fill missing docs | Create `docs/KNOWN_LIMITATIONS.md`, `docs/DATA_MODEL.md`, `docs/API_SURFACE.md` |
| 4.6 | README update | Update with MVP badges, setup instructions, architecture diagram |
| 4.7 | Firebase security rules final review | Ensure `firestore.rules` cover all collections and edge cases |
| 4.8 | Manual smoke test | Walk through register → create goal → deposit → complete on web + mobile |
| 4.9 | Performance check | App startup <3s, deposit action <1.5s P95 |

**Exit criteria**: CI green. Manual smoke pass. Known limitations documented.

---

## 4. ARCHITECTURE CHANGES

### 4.1 Before (Current State)

```
src/
  types/Theme.ts          ← Only Theme types exist
  services/goalService.ts  ← Goal interface defined inline
  services/depositService.ts ← Deposit interface defined inline
  hooks/useStreak.ts       ← UserStats interface defined inline
  screens/DepositScreen.tsx ← Calls firebase/firestore directly (layer violation)
                              Contains streak+badge logic (should be in utils/)
  (no theme.ts)            ← Colors hardcoded everywhere
```

### 4.2 After (MVP Target)

```
src/
  types/index.ts          ← Goal, Deposit, UserStats, BadgeId, Theme (all shared types)
  config/theme.ts         ← Design tokens (colors, spacing, radius, typography)
  config/featureFlags.ts  ← Feature flags
  config/runtime.ts       ← isE2EMode (existing)
  utils/depositUtils.ts   ← getCrossedMilestones, getStreakUpdate, getBadgeState (NEW)
  utils/badges.ts         ← computeEarnedBadges (existing, reuses shared types)
  services/goalService.ts ← Uses Goal from types/, no inline def
  services/depositService.ts ← Uses Deposit from types/, no inline def
  hooks/useStreak.ts       ← Uses UserStats from types/, no inline def
  screens/DepositScreen.tsx ← No Firebase calls. No business logic. Calls hooks + utils.
```

---

## 5. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Design system migration causes visual regressions | High | Medium | Track in a branch, screenshot key screens before/after |
| E2E tests break after design changes | Medium | High | Use accessibility labels (not text content) for selectors |
| Theme migration touches >400 lines (PR limit) | High | Medium | Split into per-component PRs, apply `large-pr-approved` label |
| Firebase rules don't cover cascade delete | Low | High | Test `deleteGoalWithDeposits` in E2E mode + real Firestore |
| User tests don't perceive "cozy game" vibe | Medium | High | Show designs to a non-team user before implementing |

---

## 6. POST-MVP ROADMAP (Bleeding Edge)

After MVP validation:

| Priority | Feature | Signal to Build |
|----------|---------|-----------------|
| P1 | Premium themes (revenue) | Users ask for more themes |
| P1 | Push notifications | Deposit frequency drops after week 2 |
| P2 | Recurring deposits | Users say "I forgot to deposit" |
| P2 | Lottie animations | Pixel-art ceiling reached |
| P3 | Dark mode | User requests |
| P3 | Social / shared goals | "I want to save with my partner" |
| P4 | Admin console | User base > 100 |
| P4 | Multi-currency | User base outside US |

---

## 7. TOTAL EFFORT ESTIMATE

| Phase | Tasks | Est. Days | Dependencies |
|-------|-------|-----------|-------------|
| Phase 0: Foundation | 7 | 3-4 | None |
| Phase 1: Design System | 21 | 4-5 | Phase 0 |
| Phase 2: Visual Polish | 10 | 4-5 | Phase 1 |
| Phase 3: Testing | 13 | 4-5 | Phase 0 (parallel with 1-2) |
| Phase 4: Release | 8 | 3-4 | All prior |
| **Total** | **59** | **18-23** | — |

**Parallelism**: Phase 0 and Phase 3 can overlap. Phase 2 must follow Phase 1.

**Total calendar time**: 4-5 weeks with one person. 2-3 weeks with two people (parallelize
Phase 0 + Phase 1 frontend work).
