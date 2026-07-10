# Runbooks — Goald

> Emergency procedures and operational runbooks. Keep updated.

---

## 1. Emergency OTA Rollback

**When:** Critical bug in production Expo update (crash loop, data loss, security issue)

**Steps:**
1. Open Expo dashboard: https://expo.dev/accounts/[owner]/projects/goald
2. Navigate to **Updates** → **History**
3. Find the last known-good update (green checkmark)
4. Click **...** → **Rollback to this update**
5. Confirm rollback
6. Monitor crashlytics / Sentry for 15 min
7. Post-incident: create GitHub issue with `incident` label, run retro within 48h

**Rollback time target:** < 10 minutes

---

## 2. Firebase Auth Outage

**When:** Users cannot sign in/register, Firebase Console shows auth errors

**Steps:**
1. Check Firebase Status Dashboard: https://status.firebase.google.com/
2. If regional outage: wait for Google to resolve, communicate via status page
3. If project-specific: check Auth > Settings for quota limits, disabled providers
4. Verify `EXPO_PUBLIC_FIREBASE_*` env vars in Expo project settings
5. Check Cloud Functions logs if using custom auth triggers

**Escalation:** If > 30 min, page on-call engineer

---

## 3. Firestore Quota Exceeded

**When:** Writes fail with `RESOURCE_EXHAUSTED` or `QUOTA_EXCEEDED`

**Steps:**
1. Check Firebase Console > Firestore > Usage tab
2. If daily quota: wait for reset (midnight PT) or upgrade plan
3. If burst quota: check for runaway listeners / writes in code
4. Review recent deploys for new listeners or batch writes
5. Consider enabling offline persistence to reduce re-sync writes

**Prevention:** Monitor write rate via `npm run metrics` (future)

---

## 4. Expo Build Failure (EAS)

**When:** `eas build` fails on iOS/Android

**Steps:**
1. Run `eas build --platform [ios|android] --profile preview --local` to debug locally
2. Check `eas build:list` for recent logs
3. Common fixes:
   - Clear cache: `eas build --clear-cache`
   - Update Expo SDK: `expo install --fix`
   - Check `app.json` / `eas.json` for config drift
4. For iOS: verify Apple Developer certs/profiles not expired
5. For Android: verify keystore password in EAS secrets

**Escalation:** If blocked > 2h, create `blocked` issue, tag platform lead

---

## 5. E2E Test Flakiness in CI

**When:** `test:e2e:ci` fails intermittently

**Steps:**
1. Re-run workflow (GitHub Actions "Re-run jobs")
2. If passes on retry: document flake in issue, investigate root cause
3. Common causes:
   - Timing: increase `waitFor` timeouts in step definitions
   - Port conflict: ensure `web:e2e` starts on 3000 before tests
   - Async state: add `await page.waitForLoadState('networkidle')`
4. If > 20% flake rate: disable flaky scenario, fix in next sprint

---

## 6. Dependency Vulnerability (npm audit)

**When:** `npm audit` shows high/critical vuln, or Dependabot PR

**Steps:**
1. Run `npm audit fix` for auto-fixable
2. For manual: check if vuln is in devDependency (lower risk)
3. If transitive: try `npm install <pkg>@latest` or add `overrides` in package.json
4. Test: `npm run preflight` must pass
5. Merge Dependabot PRs after CI green

**SLA:** Critical = 24h, High = 72h, Moderate = next sprint

---

## 7. Codespace / Dev Container Issues

**When:** Codespace fails to start, opencode not installed, ports not forwarding

**Steps:**
1. Rebuild container: `make clean setup` (from host)
2. Check `.devcontainer/postCreateCommand.sh` logs
3. Verify `opencode` in PATH: `which opencode`
4. For port issues: check `.devcontainer/devcontainer.json` `forwardPorts`
5. If persistent: delete codespace, create new

---

## 8. Feature Flag Emergency Disable

**When:** New feature causing crashes/errors in production

**Steps:**
1. Set `EXPO_PUBLIC_FEATURE_<NAME>=false` in Expo project env vars
2. Trigger new OTA update: `eas update --branch production --message "Disable <feature> flag"`
3. Monitor for 10 min
4. Fix root cause, test, re-enable via same process

**Flags available:** `FEATURE_BEAR`, `FEATURE_MISSIONS`, `FEATURE_CAVES`

---

## Contacts

| Role | Contact |
|---|---|
| On-call Engineer | @deilert00 (GitHub) |
| Expo Project Owner | @deilert00 |
| Firebase Project Owner | @deilert00 |

---

*Last updated: 2025-01-10*