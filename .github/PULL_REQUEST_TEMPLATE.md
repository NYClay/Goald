## What this PR does

<!-- One sentence summary -->

## Top 2–3 failure modes

<!-- What could go wrong with this change? -->

1. 
2. 
3. 

## Tests covering this change

<!-- List test files or describe what was tested -->

- [ ] Unit tests added/updated
- [ ] Manual testing performed

## Architecture check

- [ ] No layer violations (screens ← hooks ← services ← Firebase)
- [ ] New types added to `src/types/index.ts`
- [ ] Business logic in `utils/`, not in screens or components
- [ ] E2E mode branch added to any new service function

## Judgment calls flagged for human review

<!-- Anything you're unsure about or want the reviewer to weigh in on -->

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test:unit` passes
- [ ] No secrets or credentials committed
