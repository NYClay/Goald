# Known Limitations — Goald

> Issues and gaps that exist today. Do not make these worse. If your PR would add a new limitation, flag it.

---

## 1. No Real Firebase Auth in E2E Mode

**Impact:** E2E tests run against in-memory stubs, not real Firebase.
**Risk:** E2E passing does not prove auth works in production.
**Mitigation:** Manual QA against real Firebase before any release.

---

## 2. No Admin Panel

**Impact:** No self-serve user lookup, password reset, or account disable from a UI.
**Workaround:** CLI script at `scripts/admin-support.mjs` for basic operations.
**Path:** Phase A of delivery roadmap — admin console is a prerequisite for production.

---

## 3. No Observability Stack

**Impact:** No frontend error tracking, no auth funnel metrics, no goal funnel metrics in production.
**Planned:** Sentry/Datadog RUM for error tracking; custom event logging for funnels.
**Blocker:** Requires production Firebase project and deployment pipeline.

---

## 4. No MFA Support

**Impact:** Account security relies solely on email/password.
**Planned:** Phase C of delivery roadmap.
**Mitigation:** Password policy minimum 8 characters; brute-force mitigation via Firebase controls.

---

## 5. No Password Rotation Policy

**Impact:** Users can keep passwords indefinitely after initial creation.
**Planned:** Phase B of delivery roadmap.

---

## 6. Bear XP/Level Formula Is Static

**Impact:** XP thresholds are hardcoded in `LEVEL_XP` constant. No remote configuration or tuning.
**Mitigation:** Values are reasonable for MVP; remote config is a future enhancement.

---

## 7. No Offline Persistence

**Impact:** Firestore reads require network. If connection drops, data goes stale. On mobile, backgrounding the app can cause brief read failures on resume.
**Current state:** `getFirestore(app)` is called with no settings. The Firebase JS SDK's `enableIndexedDbPersistence()` requires IndexedDB, which is **not available in React Native**. There is no offline-related error handling in any service.
**Options:**
1. **Accept the gap** (recommended for MVP). Firebase SDK handles automatic retry/reconnect. Most Expo users are on WiFi/cellular.
2. **Expo FileSystem caching** — cache key goal data locally for offline read. Adds complexity.
3. **Firebase native SDK** — would require ejecting from Expo or using a config plugin. Not feasible with Expo managed workflow.
4. **Firestore Lite SDK** — lighter weight but does not support real-time listeners or offline persistence either.

---

## 8. No Data Export or Deletion

**Impact:** Users cannot export or delete their account data from the app.
**Planned:** Required for GDPR/CCPA compliance before production.

---

## 9. No Notification Delivery

**Impact:** No push notifications or in-app notification center. The `notifications` Firestore collection is defined in `firestore.rules` but never read or written by any code. In-app toast feedback (success/error) exists but is generic UI, not a notification system.
**Current state:** `PRODUCT_REQUIREMENTS_DEVOPS.md` §2.5 describes the intended system (monthly reminders, milestone alerts, completion). No `notificationService.ts`, no `useNotifications` hook, no notification UI component exists.
**Planned:** Firebase Cloud Messaging (FCM) integration. Requires `expo-notifications` plugin, FCM server key setup, and a notification trigger service that creates Firestore documents when milestones are crossed (using `getCrossedMilestones()` from `depositUtils.ts`). Post-MVP — see `SHIP_PLAN.md`.

---

## 10. Single Bear Per User

**Impact:** Each user can only have one bear. No multi-bear or social features.
**Mitigation:** Intentional design choice for MVP simplicity.

---

*Last updated: 2025-01-10*
