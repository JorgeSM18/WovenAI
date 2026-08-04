import type { Meta, StoryObj } from '@storybook/react-vite';

import { WeatherPill } from './WeatherPill';

const meta = {
  title: 'Molecules/WeatherPill',
  component: WeatherPill,
  args: { temperature: '22°C', condition: 'Sunny' },
} satisfies Meta<typeof WeatherPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TempOnly: Story = { args: { condition: undefined } };
