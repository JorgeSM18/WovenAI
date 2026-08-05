import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../atoms/Text';
import { TwoColumnTemplate } from './TwoColumnTemplate';

const meta: Meta<typeof TwoColumnTemplate> = {
  title: 'Templates/TwoColumnTemplate',
  component: TwoColumnTemplate,
  args: {
    sidebar: <Text variant="headline-md">Sidebar</Text>,
    children: <Text variant="body-lg">Main content</Text>,
  },
};

export default meta;
type Story = StoryObj<typeof TwoColumnTemplate>;

export const Default: Story = {};
