# API Surface — Goald

> Every public service and utility function. Read before writing new code.

---

## services/

### `src/services/firebase.ts`

| Export | Signature | Description |
|---|---|---|
| `isFirebaseConfigured` | `boolean` | True when all `EXPO_PUBLIC_FIREBASE_*` env vars are set |
| `app` | `FirebaseApp \| undefined` | Initialized Firebase app (undefined in E2E mode) |
| `auth` | `Auth \| undefined` | Firebase Auth instance (undefined in E2E mode) |
| `db` | `Firestore \| undefined` | Firestore instance (undefined in E2E mode) |
| `assertFirebaseConfigured()` | `() => void` | Throws if Firebase env vars are missing and not in E2E mode |

### `src/services/authService.ts`

| Export | Signature | Description |
|---|---|---|
| `register()` | `(email: string, password: string) => Promise<User>` | Creates a Firebase Auth user and initializes a default bear document |
| `login()` | `(email: string, password: string) => Promise<User>` | Signs in an existing user |
| `logout()` | `() => Promise<void>` | Signs out the current user |
| `onAuthChanged()` | `(cb: (user: User \| null) => void) => () => void` | Subscribes to auth state changes; returns unsubscribe |

### `src/services/bearService.ts`

| Export | Signature | Description |
|---|---|---|
| `createBear()` | `(userId: string, name: string) => Promise<string>` | Creates a bear document in Firestore; returns the bear ID |
| `getBear()` | `(bearId: string) => Promise<Bear \| null>` | Fetches a bear document by ID |
| `subscribeBear()` | `(bearId: string, cb: (bear: Bear \| null) => void) => () => void` | Real-time subscription to a bear document |
| `feedBear()` | `(bearId: string, amountCents: number) => Promise<FeedResult>` | Grants XP, levels up bear, unlocks accessories, updates mood |

### `src/services/caveService.ts`

| Export | Signature | Description |
|---|---|---|
| `createCave()` | `(userId: string, data: ...) => Promise<string>` | Creates a cave; returns the cave ID |
| `getCave()` | `(caveId: string) => Promise<Cave \| null>` | Fetches a single cave by ID |
| `getUserCaves()` | `(userId: string) => Promise<Cave[]>` | Fetches all caves for a user |
| `subscribeUserCaves()` | `(userId: string, cb: (caves: Cave[]) => void) => () => void` | Real-time subscription to all user caves |
| `depositToCave()` | `(caveId: string, amountCents: number) => Promise<CaveProgress>` | Adds funds, unlocks furniture, marks completion when target reached |

### `src/services/missionService.ts`

| Export | Signature | Description |
|---|---|---|
| `getOrCreateStreak()` | `(userId: string) => Promise<Streak>` | Fetches or initializes a user's mission streak |
| `getTodaysMission()` | `(userId: string, bearLevel: number) => Promise<DailyMission \| null>` | Fetches or generates today's mission |
| `completeMission()` | `(userId: string, mission: DailyMission) => Promise<MissionResult>` | Marks mission done, updates streak/fire level, awards badges |

---

## utils/

### `src/utils/format.ts`

| Export | Signature | Description |
|---|---|---|
| `formatCurrency()` | `(value: number) => string` | Formats number as `$X.XX` |
| `formatWholeNumber()` | `(value: number) => string` | Formats number with locale separators |
| `parseNumberInput()` | `(value: string) => number` | Strips commas/whitespace, returns parsed float (or 0) |

### `src/utils/errorUtils.ts`

| Export | Signature | Description |
|---|---|---|
| `getErrorMessage()` | `(error: unknown, fallback?: string) => string` | Safely extracts message from unknown caught value |

### `src/utils/badges.ts`

| Export | Signature | Description |
|---|---|---|
| `Badge` | `interface { id, title, description, emoji }` | Badge definition shape |
| `ALL_BADGES` | `Badge[]` | Complete catalog of 18 badge definitions |
| `computeEarnedBadges()` | `(params) => BadgeId[]` | Evaluates badge eligibility and returns earned badge IDs |

### `src/utils/bearUtils.ts`

| Export | Signature | Description |
|---|---|---|
| `calculateSize()` | `(level: number) => Size` | Maps level to size: 1-3=cub, 4-7=grown, 8-10=giant |
| `calculateMood()` | `(lastFeedDate: string \| null, xp: number) => Mood` | Derives mood from days since last feed and XP |
| `calculateLevel()` | `(xp: number) => number` | Computes level from cumulative XP |
| `xpForNextLevel()` | `(level: number) => number` | XP needed for next level (0 if max) |
| `getBearDisplayData()` | `(bear: Bear) => { size, level, xpProgress, xpToNext, accessories, mood }` | All display-ready properties for rendering the bear |
| `getCaveProgress()` | `(cave: Cave) => number` | Cave progress as 0-1 fraction |

### `src/utils/depositUtils.ts`

| Export | Signature | Description |
|---|---|---|
| `DepositStatsInput` | `interface` | Input shape for deposit stats computation |
| `DepositStatsOutput` | `interface` | Output shape with all derived deposit results |
| `getCrossedMilestones()` | `(prev: number, next: number) => number[]` | Which 25/50/75% milestones were crossed |
| `calculateStreak()` | `(current: number, last: string) => { newStreak, currentMonth }` | Updated monthly deposit streak |
| `computeDepositStats()` | `(input: DepositStatsInput) => DepositStatsOutput` | Orchestrator for all deposit-derived calculations |

### `src/utils/compoundInterest.ts`

| Export | Signature | Description |
|---|---|---|
| `projectGrowth()` | `(balance, contrib, rate, months) => number[]` | Month-by-month balance projection |
| `estimateCompletionMonths()` | `(balance, target, contrib, rate) => number` | Months to reach target (capped at 1200) |

---

## hooks/

| Hook | File | Signature | Description |
|---|---|---|---|
| `useAuth` | `src/hooks/useAuth.ts` | `() => { user, loading }` | Subscribes to Firebase Auth state |
| `useBear` | `src/hooks/useBear.ts` | `() => { bear, loading, feeding, displayData, feed, refetch }` | Manages bear state via real-time subscription |
| `useCaves` | `src/hooks/useCaves.ts` | `() => { caves, loading, depositing, deposit, getProgress, refetch }` | Manages all user caves via real-time subscription |
| `useMissions` | `src/hooks/useMissions.ts` | `(bear) => { mission, streak, loading, completing, complete, hasMission, isCompleted }` | Fetches mission/streak, provides complete action |

---

## context/

| Export | File | Signature | Description |
|---|---|---|---|
| `BearProvider` | `src/context/BearContext.tsx` | `({ children }) => JSX.Element` | Unified bear/cave/mission state provider |
| `useBearContext` | `src/context/BearContext.tsx` | `() => BearContextValue` | Full context value (bear, caves, mission, actions) |

---

## config/

| Export | File | Signature | Description |
|---|---|---|---|
| `isE2EMode` | `src/config/runtime.ts` | `boolean` | True when E2E mode is active or Firebase is not configured |
| `colors` | `src/config/theme.ts` | `{ bg, fur, accent, text, border, state }` | Semantic color palette |
| `spacing()` | `src/config/theme.ts` | `(n: number) => number` | Spacing scale (0-64px) |
| `radius` | `src/config/theme.ts` | `{ sm, md, lg, xl, full, bear }` | Border-radius scale |
| `typography` | `src/config/theme.ts` | `{ fontFamilies, sizes, weights }` | Font tokens |
| `shadows` | `src/config/theme.ts` | `{ card, modal, bear }` | Elevation presets |
| `animation` | `src/config/theme.ts` | `{ fast, normal, slow, spring, bounce }` | Timing and spring configs |

---

## components/

| Component | File | Props | Description |
|---|---|---|---|
| `BearCharacter` | `src/components/BearCharacter.tsx` | `{ bear, size?, onPress?, animated? }` | Animated bear with mood, accessories, breathing |
| `FeedModal` | `src/components/FeedModal.tsx` | `{ visible, onClose, onFeed, bear }` | Modal for feeding bear with preset amounts and result card |

---

*Generated from source. 87 exports across 22 files.*
