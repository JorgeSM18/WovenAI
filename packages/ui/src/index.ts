// Public entry for the Woven design system (packages/ui).
export { cn } from './utils/cn';

export { Text, type TextProps, type TextVariant } from './atoms/Text';
export { Button, type ButtonProps, type ButtonVariant } from './atoms/Button';
export { Icon, type IconProps, type IconName } from './atoms/Icon';
export { IconButton, type IconButtonProps } from './atoms/IconButton';
export { Chip, type ChipProps } from './atoms/Chip';
export { Input, type InputProps } from './atoms/Input';
export { Select, type SelectProps } from './atoms/Select';
export { ColorSwatch, type ColorSwatchProps } from './atoms/ColorSwatch';
export { Avatar, type AvatarProps } from './atoms/Avatar';
export { Badge, type BadgeProps, type BadgeVariant } from './atoms/Badge';
export { ProgressBar, type ProgressBarProps } from './atoms/ProgressBar';
export { Skeleton, type SkeletonProps } from './atoms/Skeleton';
export { Fab, type FabProps } from './atoms/Fab';

export { AppHeader, type AppHeaderProps } from './molecules/AppHeader';
export { FlowHeader, type FlowHeaderProps } from './molecules/FlowHeader';
export { SearchBar, type SearchBarProps } from './molecules/SearchBar';
export {
  ViewModeToggle,
  type ViewModeToggleProps,
  type ViewModeOption,
} from './molecules/ViewModeToggle';
export { CollectionChipRow, type CollectionChipRowProps } from './molecules/CollectionChipRow';
export { StatCard, type StatCardProps } from './molecules/StatCard';
export { GarmentCard, type GarmentCardProps } from './molecules/GarmentCard';
export { WeatherPill, type WeatherPillProps } from './molecules/WeatherPill';
export { SettingRow, type SettingRowProps } from './molecules/SettingRow';

export { BottomNavBar, type BottomNavBarProps, type BottomNavItem } from './organisms/BottomNavBar';
export { TopNavBar, type TopNavBarProps, type TopNavItem } from './organisms/TopNavBar';

export {
  ThemeProvider,
  useTheme,
  type ThemeProviderProps,
  type ThemeContextValue,
  type ThemeMode,
  type ResolvedScheme,
} from './theme/ThemeProvider';

export { TabScreenTemplate, type TabScreenTemplateProps } from './templates/TabScreenTemplate';
export {
  FullScreenFlowTemplate,
  type FullScreenFlowTemplateProps,
} from './templates/FullScreenFlowTemplate';
export { EmptyStateTemplate, type EmptyStateTemplateProps } from './templates/EmptyStateTemplate';
export { TwoColumnTemplate, type TwoColumnTemplateProps } from './templates/TwoColumnTemplate';
