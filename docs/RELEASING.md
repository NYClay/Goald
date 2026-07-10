# Release Process — Goald

---

## Versioning

We use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR** — breaking API or data model changes
- **MINOR** — new features (behind feature flags)
- **PATCH** — bug fixes, performance, docs

---

## Release Steps

### 1. Pre-release Checklist

```bash
npm run preflight   # lint + typecheck + tests + coverage
```

All must pass. No `skip` or `todo` tests in the release commit.

### 2. Bump Version

```bash
npm version <patch|minor|major> --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: release vX.Y.Z"
```

### 3. Tag

```bash
git tag vX.Y.Z
```

### 4. Push

```bash
git push origin main --tags
```

### 5. Expo OTA Update

```bash
eas update --branch production --message "vX.Y.Z: <one-line summary>"
```

### 6. Post-release

- [ ] Create GitHub Release from tag with release notes
- [ ] Monitor crashlytics/Sentry for 15 min
- [ ] If issues: see `docs/RUNBOOKS.md` → Emergency OTA Rollback

---

## Hotfix Process

1. Create `hotfix/vX.Y.Z` branch from `main`
2. Fix + test + `npm run preflight`
3. Merge to `main`, tag, push, OTA update
4. Cherry-pick to `develop` if separate branch exists

---

## Feature Flag Rollback

New feature causing issues? Disable without a release:

```bash
# In Expo project settings, set:
EXPO_PUBLIC_FEATURE_<NAME>=false

# Then trigger OTA:
eas update --branch production --message "Disable <feature>"
```

See `docs/RUNBOOKS.md` § Feature Flag Emergency Disable.

---

*Last updated: 2026-07-10*
