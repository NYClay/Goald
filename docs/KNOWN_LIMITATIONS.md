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

**Impact:** Firestore reads require network. App may show stale data if connection is lost.
**Mitigation:** Firebase SDK handles basic retry/reconnect. True offline support requires Firestore offline persistence (not yet enabled).

---

## 8. No Data Export or Deletion

**Impact:** Users cannot export or delete their account data from the app.
**Planned:** Required for GDPR/CCPA compliance before production.

---

## 9. No Notification Delivery

**Impact:** Notifications are defined in the data model but not delivered (no push notification service configured).
**Planned:** Firebase Cloud Messaging integration in a future phase.

---

## 10. Single Bear Per User

**Impact:** Each user can only have one bear. No multi-bear or social features.
**Mitigation:** Intentional design choice for MVP simplicity.

---

*Last updated: 2025-01-10*
