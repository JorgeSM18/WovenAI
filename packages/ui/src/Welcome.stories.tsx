import type { Meta, StoryObj } from '@storybook/react-vite';

// Placeholder story to validate the Storybook setup (T-0006).
// Real design-system components and their stories arrive in T-0102+.
function Welcome() {
  return <h1>Woven UI</h1>;
}

const meta = {
  title: 'Woven/Welcome',
  component: Welcome,
} satisfies Meta<typeof Welcome>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
