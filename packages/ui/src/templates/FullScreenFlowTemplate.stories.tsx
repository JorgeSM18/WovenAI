import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../atoms/Text';
import { FullScreenFlowTemplate } from './FullScreenFlowTemplate';

const meta: Meta<typeof FullScreenFlowTemplate> = {
  title: 'Templates/FullScreenFlowTemplate',
  component: FullScreenFlowTemplate,
  args: {
    children: (
      <Text variant="display-lg" className="p-md">
        Capture
      </Text>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof FullScreenFlowTemplate>;

export const Default: Story = {};
