# @woven/ui

The Woven design system: atoms, molecules, organisms, templates and the theme
provider. Components are React Native + NativeWind, rendered on web via
`react-native-web`.

## Storybook

- `pnpm --filter @woven/ui storybook` — dev.
- `pnpm --filter @woven/ui build-storybook` — static build.

## Visual regression (T-0111)

`test:visual` runs the Storybook test-runner, which screenshots each story and
compares it against a committed baseline in `__snapshots__/`.

Run it with Storybook served and Playwright browsers installed:

```bash
npx playwright install --with-deps
pnpm --filter @woven/ui build-storybook
npx http-server packages/ui/storybook-static -p 6006 &
pnpm --filter @woven/ui test:visual:ci
```

**Baselines must be generated/updated in CI** (a consistent browser + OS) so
they are reproducible — do not commit baselines generated on a local machine.
