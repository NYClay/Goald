# Ship Plan — From Current State to World-Famous MVP

## The Gap

Your app works. It doesn't feel like anything yet. The gap between "works" and "world-famous MVP" is **3 things**:

1. **One architecture fix** that prevents a real production bug
2. **One visual pass** that makes it feel like a cozy game
3. **One trust layer** so users don't lose data

Everything else is nice-to-have. Here's exactly what to do, in order.

---

## Week 1: Stop the Bleeding

*No new features. No design work. Just make what exists correct.*

### Day 1-2: Shared types + extract business logic

| Task | Files | Why |
|------|-------|-----|
| Create `src/types/index.ts` with `Goal`, `Deposit`, `UserStats`, `BadgeId` | New file | Prevents field drift between services/hooks |
| Delete inline `Goal` from `goalService.ts`, `Deposit` from `depositService.ts`, `UserStats` from `useStreak.ts` | 3 files | Single source of truth |
| Extract streak/badge logic from `DepositScreen.tsx` → `src/utils/depositUtils.ts` | DepositScreen, new file, test file | Makes it testable. Right now you can't unit test your badge earning logic |
| Remove `firebase/firestore` import from `DepositScreen.tsx` | DepositScreen | Fixes the layer violation. Route through `useStreak` instead |

**Do NOT touch any other file.** Stop when these 4 things compile.

### Day 3-4: Test the critical path

| Task | Why |
|------|-----|
| Test `computeEarnedBadges` — every badge edge case | This logic is currently buried in a screen. One bad merge and badges don't earn |
| Test `depositUtils.getCrossedMilestones` — milestone boundaries | Off-by-one means no celebration animation at 50% |
| Test `createGoal` + `addDeposit` in E2E mode | Your services have zero tests. Verify they actually write/read correctly |
| Add a simple React error boundary | Wrap `<AppNavigator>` so one crash doesn't white-screen |

**Exit criteria**: `npm run test:unit` passes with ≥5 new tests. Error boundary catches crashes.

---

## Week 2: The Cozy Pass

*The shortest path to making it feel like a game. Not a full design system — just the 80/20.*

### Day 1-2: Color + typography swap

| What | Do This |
|------|---------|
| Create `src/config/theme.ts` | Export `colors`, `spacing`, `radius`, `typography` tokens |
| Swap all `#F0FFF0` → `colors.bg.cream` `#FDF6EE` | 5-6 files. This single change does more for the vibe than anything else |
| Swap all `#4CAF50` → `colors.accent.moss` `#5B8C5A` | 10+ files. Warm green instead of finance green |
| Swap all `#1A1A2E` → `colors.text.primary` `#2C1810` | Headings across all screens. Softer dark instead of harsh black |
| Swap all `#fff` cards → `colors.bg.card` `#FFF9F0` | All card backgrounds. Warm white instead of sterile white |

**Key insight**: You don't need to touch every style. Just the 4-5 most-used colors. This covers 90% of the visual surface area.

### Day 3: Copy rewrite (30 min)

| Screen | Change |
|--------|--------|
| Landing | "Start your savings adventure" not "Create Account" |
| Create Goal | "What are you saving for?" not "Goal Name" |
| Empty states | "Plant your first seed" not "No goals yet" |
| Deposit success | "You just leveled up!" not "Deposit recorded" |
| Dashboard portfolio card | "Your Progress Garden" not "Portfolio Snapshot" |

**Do not touch any component logic.** Only change text strings.

### Day 4-5: Three micro-interactions

| Interaction | Implementation |
|-------------|---------------|
| Deposit confirm | After submit, show `+$50` float-up animation (1s fade), then navigate back. ~20 lines |
| Streak display | Replace "🔥 X-month streak" text with a small animated plant that grows. Use `Animated.View` with increasing height |
| Bottom tab bar | Rounded top corners, warm `#FFF9F0` background, green active indicator |

**Rule**: Each micro-interaction must be <50 lines of new code. If it's bigger, it's scope creep.

---

## Week 3: Ship

### Day 1-2: Fix lint warnings + CI

| Task | Details |
|------|---------|
| Fix `CelebrationScreen` useEffect deps | 2 warnings → 0 warnings. This matters because `CI quality` shows yellow |
| Add `npm run test:unit` to `ci-quality.yml` | Right now CI only lints + typechecks. Add tests |
| Quick manual smoke test | Register → create goal → deposit 3x → complete → celebration. On web. Takes 5 min |

### Day 3-4: Write the story

| Doc | Content |
|-----|---------|
| `README.md` update | One-liner, screenshot, "try it: \`npm run web\`", known limitations |
| `docs/KNOWN_LIMITATIONS.md` | 5 bullets max. What doesn't work yet |
| Ship checklist | PR with all changes. AI review block from AGENTS.md |

### Day 5: Launch

Tag a release. Send the link to 5 friends. Watch them use it. Fix what they bump into.

---

## What NOT to do (scope traps)

| Temptation | Why Skip |
|------------|----------|
| Full design system on every component | 80/20 rule. Just the color swap + copy change gets you 80% of the vibe |
| Lottie animations | You already have pixel-art views that work. Lottie is a week of setup for no user benefit |
| Offline support | Real engineering effort. Ship without it, add when users ask |
| Push notifications | You don't have users to notify yet |
| All 10 missing docs | Only write `KNOWN_LIMITATIONS.md`. The rest are internal references |
| Dark mode | Not a single user will pick dark mode over "cozy game" on day 1 |
| Premium themes | Monetization before product-market fit is premature |

---

## Total: 3 weeks, one person

| Week | Focus | Outcome |
|------|-------|---------|
| 1 | Architecture + tests | Correct, tested, won't lose data |
| 2 | Cozy visual pass + copy | Feels like a game, not a spreadsheet |
| 3 | Ship | Live, documented, in users' hands |

**The metric that matters**: Does someone who opens the app make a deposit, come back, and make another one? Not code coverage, not feature count. That's it.
