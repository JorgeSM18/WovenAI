import type { TestRunnerConfig } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

/**
 * Visual-regression config for the Storybook test-runner: screenshots each
 * story and compares it against a committed baseline.
 *
 * Baselines must be generated in CI (consistent browser/OS), not locally, or
 * they will not be reproducible. Run with Storybook served (see README).
 */
const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: '__snapshots__',
      customSnapshotIdentifier: context.id,
    });
  },
};

export default config;
