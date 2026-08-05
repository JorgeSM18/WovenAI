import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../atoms/Button';
import { EmptyStateTemplate } from './EmptyStateTemplate';

const meta: Meta<typeof EmptyStateTemplate> = {
  title: 'Templates/EmptyStateTemplate',
  component: EmptyStateTemplate,
  args: {
    title: 'Your collection starts here.',
    description: 'Build your digital archive by documenting the pieces that define your style.',
    action: <Button label="Capture your first item" />,
  },
};

export default meta;
type Story = StoryObj<typeof EmptyStateTemplate>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { description: undefined, action: undefined } };
