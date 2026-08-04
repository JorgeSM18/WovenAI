import type { Meta, StoryObj } from '@storybook/react-vite';

import { SettingRow } from './SettingRow';

const meta = {
  title: 'Molecules/SettingRow',
  component: SettingRow,
  args: { title: 'Preferences', subtitle: 'Notifications, Dark Mode, Accessibility' },
} satisfies Meta<typeof SettingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { subtitle: undefined, title: 'Language' } };
