import type { Meta, StoryObj } from '@storybook/react-vite';

import { Fab } from '../atoms/Fab';
import { Text } from '../atoms/Text';
import { TabScreenTemplate } from './TabScreenTemplate';

const meta: Meta<typeof TabScreenTemplate> = {
  title: 'Templates/TabScreenTemplate',
  component: TabScreenTemplate,
  args: {
    children: <Text variant="body-lg">Scrollable content</Text>,
    fab: (
      <Fab
        accessibilityLabel="Add"
        icon={
          <Text variant="headline-md" className="text-surface">
            ＋
          </Text>
        }
      />
    ),
  },
};

export default meta;
type Story = StoryObj<typeof TabScreenTemplate>;

export const Default: Story = {};
