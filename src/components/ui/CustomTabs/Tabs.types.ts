// types/Tabs.types.ts
export interface TabConfig {
  label: string;
  count?: number | null;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface CustomTabsProps {
  tabConfig: TabConfig[];
  selected: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCounts?: boolean;
  allowDeselect?: boolean;
  scrollable?: boolean;
  centered?: boolean;
}
