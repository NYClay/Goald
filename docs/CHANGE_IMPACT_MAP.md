# Change Impact Map — Goald

> When you change a core type or file, this map tells you what else needs to change.
> Use this before submitting a PR that touches types, services, or utils.

---

## Core Types → Affected Files

### `Bear` (src/types/index.ts)

| Change | Files to Update |
|---|---|
| Add/remove field | `bearService.ts`, `bearUtils.ts` (getBearDisplayData), `BearContext.tsx`, `useBear.ts`, `BearCharacter.tsx`, `FeedModal.tsx`, `e2eStore.ts` |
| Change `Size` union | `bearUtils.ts` (calculateSize), `BearCharacter.tsx`, `e2eStore.ts` |
| Change `Mood` union | `bearUtils.ts` (calculateMood), `BearCharacter.tsx`, `e2eStore.ts` |
| Change `AccessoryId` | `types/index.ts` (ACCESSORY_UNLOCKS), `BearCharacter.tsx`, `FeedModal.tsx`, `e2eStore.ts` |

### `Cave` (src/types/index.ts)

| Change | Files to Update |
|---|---|
| Add/remove field | `caveService.ts`, `bearUtils.ts` (getCaveProgress), `useCaves.ts`, `BearContext.tsx`, `e2eStore.ts` |
| Change `CaveTheme` | `types/index.ts` (CAVE_FURNITURE), `caveService.ts`, `e2eStore.ts` |
| Change `FurnitureId` | `types/index.ts` (CAVE_FURNITURE), `caveService.ts`, `e2eStore.ts` |

### `DailyMission` (src/types/index.ts)

| Change | Files to Update |
|---|---|
| Add/remove field | `missionService.ts`, `useMissions.ts`, `BearContext.tsx`, `e2eStore.ts`, `DashboardScreen.tsx` |
| Change `MissionType` | `types/index.ts` (MISSION_XP), `missionService.ts`, `e2eStore.ts` |

### `Streak` (src/types/index.ts)

| Change | Files to Update |
|---|---|
| Add/remove field | `missionService.ts`, `useMissions.ts`, `BearContext.tsx`, `e2eStore.ts` |
| Change `fireLevel` type | `missionService.ts`, `BearContext.tsx`, `e2eStore.ts` |

### `UserStats` (src/types/index.ts)

| Change | Files to Update |
|---|---|
| Add/remove field | `depositUtils.ts`, `badges.ts`, `e2eStore.ts` |
| Change `BadgeId` | `badges.ts` (ALL_BADGES, computeEarnedBadges), `depositUtils.ts`, `e2eStore.ts` |

---

## Constants → Affected Files

| Constant | Change | Files to Update |
|---|---|---|
| `ACCESSORY_UNLOCKS` | Add/change levels | `bearUtils.ts`, `BearCharacter.tsx`, `FeedModal.tsx`, `e2eStore.ts` |
| `LEVEL_XP` | Adjust thresholds | `bearUtils.ts` (calculateLevel, xpForNextLevel), `e2eStore.ts` |
| `MISSION_XP` | Adjust rewards | `missionService.ts`, `e2eStore.ts` |
| `CAVE_FURNITURE` | Add/change furniture | `caveService.ts`, `bearUtils.ts` (getCaveProgress), `e2eStore.ts` |

---

## Service → Affected Files

| Service | Change | Files to Update |
|---|---|---|
| `bearService.ts` | Change return types | `useBear.ts`, `BearContext.tsx` |
| `caveService.ts` | Change return types | `useCaves.ts`, `BearContext.tsx` |
| `missionService.ts` | Change return types | `useMissions.ts`, `BearContext.tsx`, `DashboardScreen.tsx` |
| `authService.ts` | Change auth flow | `useAuth.ts`, `BearContext.tsx` |

---

## Config → Affected Files

| Config | Change | Files to Update |
|---|---|---|
| `theme.ts` | Add/modify color/token | All `*.tsx` files using `colors`, `spacing`, `radius`, `typography`, `shadows` |
| `runtime.ts` | Change E2E detection | All service files (they check `isE2EMode`) |
| `featureFlags.ts` | Add new flag | Any screen or hook that consumes the flag |

---

## Quick Reference: "I'm Changing X"

| You're changing... | Also update... |
|---|---|
| A type in `types/index.ts` | All services that read/write it, all utils that derive from it, all hooks that expose it |
| A service function | The hook that calls it, the context that wraps it, any screen that uses the hook |
| A utility function | All importers (check with `grep -r "functionName" src/`) |
| A theme token | Grep for the token name across all `.tsx` files |
| A Firestore document structure | `firestore.rules`, `DATA_MODEL.md`, all services that touch that collection |

---

*Last updated: 2025-01-10*
