# Goal'd — Bear Companion MVP Spec

## Core Vision

> "A cozy game where saving money upgrades your life — with a bear companion that grows alongside your habits."

**Metaphor**: Your bear = your financial health. Every deposit feeds it. Every streak strengthens it. Every goal completed evolves it.

---

## MVP Scope (4 Weeks, Solo)

### IN — Core Loop
| Feature | Description |
|---------|-------------|
| **Bear** | Persistent companion (name, size, mood, accessories). Lives on Dashboard. |
| **Feed (Deposit)** | Tap bear → add money → bear eats → grows visually (size + accessories). |
| **Daily Mission** | One micro-task/day (e.g., "Save $5", "Skip a coffee", "Round up"). Completes → XP. |
| **Streak Fire** | Consecutive daily missions → flame meter. 7-day = "Iron Gut" badge. |
| **Goals as Caves** | Each savings goal = a cave to furnish. Deposits unlock furniture (bed → rug → TV → spa). |
| **Level Up** | Bear levels 1→10. Each level = new accessory slot + daily mission slot. |
| **Achievements** | 12 badges (First Feed, Week Streak, Furnished Cave, Level 5, etc.). |

### OUT (Post-MVP)
- Social / shared caves
- Push notifications
- Multi-currency
- Premium themes
- Export / data portability

---

## Visual Identity (80/20 System)

### Color Palette
| Token | Hex | Use |
|-------|-----|-----|
| `bg.warm` | `#FEF8F0` | App background |
| `bg.card` | `#FFFDF5` | Cards, modals |
| `fur.light` | `#D4A574` | Bear base color |
| `fur.dark` | `#8B5E3C` | Bear shading |
| `accent.honey` | `#F0B232` | Primary actions, XP, honey drops |
| `accent.berry` | `#D45B6E` | Streak fire, alerts |
| `accent.moss` | `#6B8E5C` | Success, growth |
| `text.ink` | `#3D2B1F` | All text |
| `text.muted` | `#9D8B7A` | Placeholders |

### Typography
- **Display**: `Nunito` / system rounded — headings, bear name
- **Body**: `Inter` / system — UI text
- **Mono**: `JetBrains Mono` — currency amounts

### Spacing / Radius
- Space: 4 / 8 / 12 / 16 / 20 / 24 / 32
- Radius: 12 (cards), 16 (modals), 999 (pills), 24 (bear circle)

---

## Information Architecture

```
App
├─ Dashboard (bear center, daily mission, streak fire, caves preview)
├─ Feed Screen (amount picker, note, bear eating animation)
├─ Caves (list of goals → each a scrollable furnished room)
│   └─ Cave Detail (furniture grid, progress, deposit button)
├─ Bear Profile (level, accessories, stats, rename)
├─ Missions Log (history, streak calendar)
└─ Settings (rename bear, reset, about)
```

---

## Data Model (Minimal)

```typescript
// src/types/index.ts
interface Bear {
  id: string;
  name: string;
  level: number;           // 1-10
  xp: number;              // 0 → 100 per level
  size: 'cub' | 'grown' | 'giant'; // derived from level
  accessories: Accessory[]; // equipped (hat, scarf, glasses, etc.)
  mood: 'hungry' | 'content' | 'happy' | 'ecstatic'; // derived from recent feeds
  createdAt: Timestamp;
}

interface Cave {           // = Savings Goal
  id: string;
  name: string;            // "Emergency Fund", "Japan Trip"
  targetAmount: number;    // in cents
  currentAmount: number;   // in cents
  furniture: FurnitureId[]; // unlocked items
  theme: 'cozy' | 'modern' | 'rustic' | 'spa'; // visual style
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

interface DailyMission {
  id: string;
  type: 'save_amount' | 'round_up' | 'skip_purchase' | 'custom';
  target: number;          // cents or count
  completed: boolean;
  xpReward: number;
  date: string;            // YYYY-MM-DD
}

interface Streak {
  current: number;
  longest: number;
  lastMissionDate: string; // YYYY-MM-DD
  fireLevel: 0 | 1 | 2 | 3; // 0=none, 1=lit, 2=blazing, 3=inferno
}

interface Achievement {
  id: string;
  earnedAt?: Timestamp;
}

type AccessoryId = 'party_hat' | 'scarf' | 'glasses' | 'crown' | 'backpack' | 'sunglasses';
type FurnitureId = 'bed' | 'rug' | 'lamp' | 'tv' | 'sofa' | 'spa' | 'fireplace' | 'garden';
type BadgeId = 'first_feed' | 'week_streak' | 'furnished_cave' | 'level_5' | 'honey_hoarder' | 'cave_master' | 'iron_gut' | 'bear_whisperer' | 'giant_bear' | 'mission_master' | 'completionist' | 'early_bird';
```

---

## Bear Growth System

| Level | XP Needed | Size | Accessory Slots | Daily Mission Slots | Unlock |
|-------|-----------|------|-----------------|---------------------|--------|
| 1 | 0 | Cub | 1 | 1 | — |
| 2 | 100 | Cub | 1 | 1 | Scarf |
| 3 | 250 | Cub | 2 | 1 | Glasses |
| 4 | 450 | Grown | 2 | 2 | Party Hat |
| 5 | 700 | Grown | 2 | 2 | **Badge: Giant Bear** |
| 6 | 1000 | Grown | 3 | 2 | Sunglasses |
| 7 | 1400 | Grown | 3 | 3 | Backpack |
| 8 | 1900 | Giant | 3 | 3 | Crown |
| 9 | 2500 | Giant | 4 | 3 | — |
| 10 | 3200 | Giant | 4 | 4 | **Badge: Bear Whisperer** |

**XP Sources**: Feed ($1 = 1 XP), Daily Mission (50-100 XP), Complete Cave (500 XP), Streak Milestone (100 XP).

---

## Daily Mission Types

| Type | Example | XP | Logic |
|------|---------|-----|-------|
| `save_amount` | "Feed bear $5" | 50 | User enters amount |
| `round_up` | "Round up 3 purchases" | 30 | Simulated — user confirms |
| `skip_purchase` | "Skip a $4 coffee" | 40 | User confirms skipped |
| `custom` | "No spend today" | 60 | User confirms |

**Mission Generation**: Each morning, pick 1 from available types weighted by user history. Level 4+ gets 2 missions/day. Level 7+ gets 3.

---

## Cave Furniture (Visual Progress)

Each cave has 8 furniture slots. Unlock order = visual build:

```
Cozy:       Bed → Rug → Lamp → Bookshelf → Sofa → Fireplace → Cat → Garden
Modern:     Mat → Desk → Monitor → Chair → Couch → TV → Plant → Balcony
Rustic:     Pallet → Blanket → Lantern → Table → Bench → Stove → Herbs → Porch
Spa:        Towel → Mat → Candle → Robe → Tub → Sauna → Stones → Zen Garden
```

**Deposit → Furniture**: Each deposit fills progress bar. At 12.5% intervals, next furniture unlocks with a pop-in animation.

---

## Key Interactions (Cozy Polish)

| Interaction | Detail |
|-------------|--------|
| **Feed Bear** | Tap bear → honey pot modal → slider ($1-$100) → confirm → bear "eats" (mouth open → close) → honey drops fall → XP ring fills → bear grows if level up |
| **Daily Mission** | Dashboard card → tap → confirm → confetti burst → streak fire grows |
| **Cave Enter** | Tap cave → horizontal scroll room → furniture slots glow when unlockable |
| **Level Up** | Full-screen: bear glows → grows → new accessory auto-equips → fireworks |
| **Streak Fire** | Dashboard bottom: 4-segment fire. Segments fill daily. Day 7 = "Iron Gut" badge + inferno mode (bigger flame) |

---

## Technical Stack (Same Foundation)

- **React Native + Expo 52** (web, iOS, Android)
- **TypeScript strict**
- **Firebase Auth + Firestore** (E2E mode for tests)
- **React Navigation** (stack + tabs)
- **No external animation lib** — `Animated` API + `LayoutAnimation` for pop-ins
- **Tests**: `node:test` (unit), Playwright+Cucumber (E2E)

---

## Week-by-Week Plan

### Week 1: Foundation & Bear
- [ ] New `src/types/index.ts` with all interfaces
- [ ] `src/config/theme.ts` (colors, spacing, radius, typography)
- [ ] `src/services/bearService.ts` (CRUD + XP calc + level up logic)
- [ ] `src/services/caveService.ts` (CRUD + furniture unlock)
- [ ] `src/services/missionService.ts` (daily gen + streak logic)
- [ ] `src/hooks/useBear.ts`, `useCaves.ts`, `useMissions.ts`
- [ ] **Dashboard**: bear circle (tap → feed), streak fire, mission card, caves preview (3)
- [ ] **Feed Modal**: amount slider, note, bear eat animation, XP ring
- [ ] Unit tests for bear XP/level, mission gen, streak calc

### Week 2: Caves & Missions
- [ ] **Caves List**: horizontal cards → tap = Cave Detail
- [ ] **Cave Detail**: horizontal scroll room, 8 furniture slots (locked → unlocked animation), progress bar, deposit button
- [ ] **Missions Log**: calendar heatmap, streak history, mission history
- [ ] **Bear Profile**: level, XP bar, accessories grid (tap to equip), rename
- [ ] Bear mood system (hungry → ecstatic based on last feed)
- [ ] Unit tests for furniture unlock, cave completion

### Week 3: Polish & Achievements
- [ ] **Achievements Screen**: 12 badges grid, earned/locked states, toast on earn
- [ ] **Level Up Screen**: full-screen bear glow → grow → accessory equip → confetti
- [ ] **Streak Fire**: 4-segment animated fire on Dashboard, inferno mode at day 7
- [ ] Feed animations: bear mouth, honey drops, XP ring fill, level-up check
- [ ] Cave furniture pop-in (scale 0→1 + bounce)
- [ ] Error boundary, offline banner, empty states
- [ ] Accessibility labels, reduced motion support

### Week 4: Ship
- [ ] E2E tests: register → feed → mission → streak → cave → level up
- [ ] CI: lint + typecheck + unit + E2E
- [ ] Static web export + preview
- [ ] `KNOWN_LIMITATIONS.md`, `README.md`
- [ ] TestFlight / Play Console internal build
- [ ] Ship to 5 friends, collect feedback

---

## Success Metrics (Week 4)

| Metric | Target |
|--------|--------|
| Session: Feed → Cave → Mission completion rate | > 60% |
| Day 1 → Day 7 retention | > 35% |
| Avg sessions/week (active users) | > 4 |
| "It feels like a game, not finance" (qualitative) | 4/5+ |

---

## What to Build First (Day 1)

1. `src/types/index.ts` — all interfaces
2. `src/config/theme.ts` — design tokens
3. `src/services/bearService.ts` — create, feed (XP), level up
4. `src/hooks/useBear.ts` — subscribe + feed mutation
5. **Dashboard** — bear circle (size by level), tap → feed modal
6. **Feed Modal** — slider, confirm, XP ring, level up toast