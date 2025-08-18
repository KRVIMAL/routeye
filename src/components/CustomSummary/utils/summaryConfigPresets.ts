// utils/summaryConfigPresets.ts - Pre-built configuration presets
// import { CustomSummaryConfig } from '../components/CustomSummary/CustomSummary';

import { CustomSummaryConfig } from "../CustomSummary";

// Base configuration that all presets extend
const BASE_CONFIG: Partial<CustomSummaryConfig> = {
  collapsible: true,
  defaultCollapsed: false,
  showNavigation: true,
  showIndicators: true,
  cardSpacing: 16,
  cardWidth: 192,
  cardHeight: 95,
  cardsPerView: {
    mobile: 1,
    tablet: 3,
    desktop: 5,
  },
};

/**
 * Devices module configuration preset
 */
export const DEVICES_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Device Summary",
  titleColor: "#1F3A8A",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
};

/**
 * Vehicles module configuration preset
 */
export const VEHICLES_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Fleet Summary",
  titleColor: "#059669",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Drivers module configuration preset (already exists - update if needed)
 */
export const DRIVERS_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Driver Statistics",
  titleColor: "#7C2D12",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 3,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Clients module configuration preset
 */
export const CLIENTS_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Clients Summary",
  titleColor: "#1F3A8A",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Groups module configuration preset
 */
export const GROUPS_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Groups Summary",
  titleColor: "#7C2D12",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Vehicle Masters module configuration preset
 */
export const VEHICLE_MASTERS_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Vehicle Masters Summary",
  titleColor: "#2563EB",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Groups Master module configuration preset (Complex groups with IMEI)
 */
export const GROUPS_MASTER_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Groups Master Summary",
  titleColor: "#1F3A8A",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4, // More cards since we have more data types
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Users module configuration preset
 */
export const USERS_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Users Summary",
  titleColor: "#1F3A8A",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Device Onboarding module configuration preset
 */
export const DEVICE_ONBOARDING_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Device Onboarding Summary",
  titleColor: "#1F3A8A",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Accounts module configuration preset
 */
export const ACCOUNTS_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Accounts Summary",
  titleColor: "#1F3A8A",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Roles module configuration preset
 */
export const ROLES_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Roles Summary",
  titleColor: "#1F3A8A",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Telecoms module configuration preset
 */
export const TELECOMS_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  title: "Telecoms Summary",
  titleColor: "#1F3A8A",
  titleStyle: {
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0.03em",
    textTransform: "capitalize",
  },
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  cardStyle: {
    boxShadow: "0px 0px 4px 0px #00000040",
  },
  headerStyle: {
    marginBottom: "16px",
  },
};

/**
 * Compact configuration - smaller cards, more per view
 */
export const COMPACT_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  cardWidth: 160,
  cardHeight: 80,
  cardSpacing: 12,
  cardsPerView: {
    mobile: 1,
    tablet: 4,
    desktop: 6,
  },
  titleStyle: {
    fontSize: "14px",
  },
};

/**
 * Large configuration - bigger cards, fewer per view
 */
export const LARGE_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  cardWidth: 240,
  cardHeight: 120,
  cardSpacing: 20,
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  titleStyle: {
    fontSize: "18px",
  },
};

/**
 * Mobile-first configuration - optimized for mobile devices
 */
export const MOBILE_FIRST_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  cardWidth: 280,
  cardHeight: 100,
  cardSpacing: 16,
  cardsPerView: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  showNavigation: false, // Rely on swipe gestures
  showIndicators: true,
};

/**
 * Dashboard configuration - optimized for dashboard views
 */
export const DASHBOARD_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  collapsible: false, // Always expanded on dashboard
  showNavigation: true,
  cardSpacing: 20,
  containerStyle: {
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
  },
};

/**
 * Minimal configuration - clean, simple design
 */
export const MINIMAL_CONFIG_PRESET: Partial<CustomSummaryConfig> = {
  ...BASE_CONFIG,
  showNavigation: false,
  showIndicators: false,
  cardStyle: {
    boxShadow: "none",
    border: "1px solid #e5e7eb",
  },
  titleStyle: {
    fontWeight: 600,
    fontSize: "14px",
    color: "#374151",
  },
};

/**
 * Utility function to merge presets with custom config
 */
export const mergeConfigPreset = (
  preset: Partial<CustomSummaryConfig>,
  customConfig: Partial<CustomSummaryConfig> = {}
): CustomSummaryConfig => {
  return {
    // Merge base preset
    ...preset,
    // Override with custom config
    ...customConfig,
    // Deep merge nested objects
    titleStyle: {
      ...preset.titleStyle,
      ...customConfig.titleStyle,
    },
    containerStyle: {
      ...preset.containerStyle,
      ...customConfig.containerStyle,
    },
    cardStyle: {
      ...preset.cardStyle,
      ...customConfig.cardStyle,
    },
    headerStyle: {
      ...preset.headerStyle,
      ...customConfig.headerStyle,
    },
    cardsPerView: {
      ...preset.cardsPerView,
      ...customConfig.cardsPerView,
    },
  } as CustomSummaryConfig;
};

// Quick preset selector function

export const getConfigPreset = (
  presetName:
    | "devices"
    | "vehicles"
    | "drivers"
    | "clients"
    | "groups"
    | "roles"
    | "users"
    | "telecoms"
    | "vehicleMasters"
    | "groups-master"
    | "device-onboarding"
    | "accounts"
    | "compact"
    | "large"
    | "mobile"
    | "dashboard"
    | "minimal",
  customConfig?: Partial<CustomSummaryConfig>
): CustomSummaryConfig => {
  const presetMap = {
    devices: DEVICES_CONFIG_PRESET,
    vehicles: VEHICLES_CONFIG_PRESET,
    drivers: DRIVERS_CONFIG_PRESET,
    clients: CLIENTS_CONFIG_PRESET,
    groups: GROUPS_CONFIG_PRESET,
    vehicleMasters: VEHICLE_MASTERS_CONFIG_PRESET,
    "groups-master": GROUPS_MASTER_CONFIG_PRESET,
    users: USERS_CONFIG_PRESET,
    "device-onboarding": DEVICE_ONBOARDING_CONFIG_PRESET,
    accounts: ACCOUNTS_CONFIG_PRESET,
    telecoms: TELECOMS_CONFIG_PRESET,
    roles: ROLES_CONFIG_PRESET,
    compact: COMPACT_CONFIG_PRESET,
    large: LARGE_CONFIG_PRESET,
    mobile: MOBILE_FIRST_CONFIG_PRESET,
    dashboard: DASHBOARD_CONFIG_PRESET,
    minimal: MINIMAL_CONFIG_PRESET,
  };

  const preset = presetMap[presetName];
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}`);
  }

  return mergeConfigPreset(preset, customConfig);
};
