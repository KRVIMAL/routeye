// utils/summaryDataTransformers.ts - Helper functions to transform API data
import React from 'react';
import { ChartData, SummaryCard } from '../CustomSummary';
// import { SummaryCard, ChartData } from '../components/CustomSummary/CustomSummary';

// Color schemes for different modules
export const COLOR_SCHEMES = {
  devices: {
    'iot': '#7987FF',
    'tracker': '#A155B9', 
    'lock': '#F765A3',
    'active': '#1E764E',
    'inactive': '#B00020',
    'default': ['#7987FF', '#A155B9', '#F765A3', '#C06C2B', '#B00020', '#1F3A8A']
  },
  vehicles: {
    'car': '#2563EB',
    'truck': '#DC2626', 
    'bus': '#059669',
    'motorcycle': '#7C2D12',
    'active': '#1E764E',
    'inactive': '#B00020',
    'maintenance': '#D97706',
    'default': ['#2563EB', '#DC2626', '#059669', '#7C2D12', '#D97706', '#6366F1']
  },
drivers: {
  // Status colors (matches your actual API data)
  'active': '#1E764E',      // Green for active drivers
  'inactive': '#B00020',    // Red for inactive drivers
  
  // Future-ready license class colors (keep for extensibility)
  'class_a': '#2563EB',     // Blue
  'class_b': '#DC2626',     // Red  
  'class_c': '#059669',     // Green
  
  // Additional status types you might add
  'on_leave': '#D97706',    // Orange
  'suspended': '#9333EA',   // Purple
  'training': '#0EA5E9',    // Light blue
  
  // Driver name specific colors (for your names chart)
  'vimal': '#2563EB',       // Blue (since this driver appears most)
  'newdriver': '#DC2626',   // Red
  'malav driver1': '#059669', // Green
  'rkr': '#7C2D12',         // Brown
  
  // Default color palette for dynamic driver names
  'default': [
    '#2563EB',  // Blue
    '#DC2626',  // Red
    '#059669',  // Green
    '#7C2D12',  // Brown
    '#D97706',  // Orange
    '#6366F1',  // Indigo
    '#EC4899',  // Pink
    '#10B981',  // Emerald
    '#8B5CF6',  // Violet
    '#F59E0B'   // Amber
  ]
},
  // ADD THIS NEW CLIENTS COLOR SCHEME:
  clients: {
    'active': '#1E764E',
    'inactive': '#B00020',
    'pending': '#F59E0B',
    'suspended': '#9333EA',
    // Indian state colors - you can customize these
    'maharashtra': '#2563EB',
    'karnataka': '#DC2626',
    'tamil nadu': '#059669',
    'uttar pradesh': '#7C2D12',
    'gujarat': '#D97706',
    'rajasthan': '#6366F1',
    'west bengal': '#EC4899',
    'madhya pradesh': '#10B981',
    'default': ['#2563EB', '#DC2626', '#059669', '#7C2D12', '#D97706', '#6366F1', '#EC4899', '#10B981']
  },
  groups: {
    'active': '#1E764E',
    'inactive': '#B00020',
    'pending': '#F59E0B',
    'archived': '#6B7280',
    // State-specific colors for Indian states
    'maharashtra': '#2563EB',
    'delhi': '#DC2626',
    'karnataka': '#059669',
    'uttar pradesh': '#7C2D12',
    'gujarat': '#D97706',
    'rajasthan': '#6366F1',
    'west bengal': '#EC4899',
    'tamil nadu': '#10B981',
    'andhra pradesh': '#8B5CF6',
    'telangana': '#F97316',
    'default': ['#2563EB', '#DC2626', '#059669', '#7C2D12', '#D97706', '#6366F1', '#EC4899', '#10B981', '#8B5CF6', '#F97316']
  },
  vehicleMasters: {
    'active': '#1E764E',
    'inactive': '#B00020',
    'maintenance': '#D97706',
    'pending': '#F59E0B',
    // Vehicle brands
    'tvs': '#2563EB',
    'maruti': '#DC2626',
    'honda': '#059669',
    'tata': '#7C2D12',
    'bajaj': '#D97706',
    'mahindra': '#6366F1',
    'hero': '#EC4899',
    'royal enfield': '#10B981',
    // Vehicle types
    'bike': '#8B5CF6',
    'car': '#F97316',
    'van': '#06B6D4',
    'truck': '#84CC16',
    'bus': '#F59E0B',
    'auto': '#EF4444',
    'default': ['#2563EB', '#DC2626', '#059669', '#7C2D12', '#D97706', '#6366F1', '#EC4899', '#10B981', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']
  },
    // Groups Master (complex groups with IMEI) colors
  groupmaster: {
    'active': '#1E764E',
    'inactive': '#B00020',
    'pending': '#F59E0B',
    'suspended': '#9333EA',
    // Group type colors
    'security': '#2563EB',
    'monitoring': '#DC2626',
    'tracking': '#059669',
    'maintenance': '#7C2D12',
    'emergency': '#D97706',
    'fleet': '#6366F1',
    'logistics': '#EC4899',
    'transport': '#10B981',
    'developer group': '#8B5CF6',
    'test': '#F59E0B',
    'default': ['#2563EB', '#DC2626', '#059669', '#7C2D12', '#D97706', '#6366F1', '#EC4899', '#10B981', '#8B5CF6', '#F59E0B']
  },
   users: {
    'active': '#1E764E',
    'inactive': '#B00020',
    'pending': '#F59E0B',
    'suspended': '#9333EA',
    // Role colors
    'admin': '#DC2626',
    'superadmin': '#7C2D12',
    'user': '#059669',
    'manager': '#D97706',
    'user1': '#6366F1',
    // 2FA Status colors
    'enabled': '#1E764E',
    'disabled': '#B00020',
    'default': ['#2563EB', '#DC2626', '#059669', '#7C2D12', '#D97706', '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#9333EA']
  },
  'device-onboarding': {
    'iot': '#7987FF',
    'tracker': '#A155B9', 
    'lock': '#F765A3',
    'active': '#1E764E',
    'inactive': '#B00020',
    // Telecom operator colors
    'airtel': '#FF0000',
    'vodafone': '#E60000',
    'jio': '#0073E6',
    'bsnl': '#FF6600',
    'vi': '#FFD700',
    'default': ['#7987FF', '#A155B9', '#F765A3', '#C06C2B', '#B00020', '#1F3A8A', '#FF0000', '#0073E6']
  },
  accounts: {
  'active': '#1E764E',
  'inactive': '#B00020',
  'pending': '#F59E0B',
  'suspended': '#9333EA',
  // Level colors
  'level_1': '#1E40AF', // Root level - dark blue
  'level_2': '#2563EB', // Level 2 - blue
  'level_3': '#3B82F6', // Level 3 - lighter blue
  'level_4': '#60A5FA', // Level 4 - even lighter
  'level_5': '#93C5FD', // Level 5 - lightest blue
  'default': ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DC2626', '#059669', '#7C2D12']
}
} as const;


// Helper function to get color for a value
export const getColorForValue = (
  value: string, 
  index: number, 
  colorScheme?: any
): string => {
  if (!colorScheme) {
    // Default fallback colors
    const defaultColors = ['#7987FF', '#A155B9', '#F765A3', '#C06C2B', '#B00020', '#1F3A8A'];
    return defaultColors[index % defaultColors.length];
  }

  const lowerValue = value.toLowerCase();
  if (colorScheme[lowerValue]) {
    return colorScheme[lowerValue];
  }
  
  return colorScheme.default[index % colorScheme.default.length];
};

// Transform API array data to chart data
export const transformToChartData = (
  items: Array<{ count: number; value: string; label: string }>,
  colorScheme?: any
): ChartData[] => {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  
  return items.map((item, index) => ({
    label: item.label,
    value: item.count,
    color: getColorForValue(item.value, index, colorScheme),
    percentage: Math.round((item.count / total) * 100),
  }));
};

// Create chart card
export const createChartCard = (
  id: string,
  title: string,
  items: Array<{ count: number; value: string; label: string }>,
  colorScheme?: any,
  subtitle?: string
): SummaryCard => ({
  id,
  type: 'chart',
  title,
  subtitle,
  data: transformToChartData(items, colorScheme),
});

// Create count card
export const createCountCard = (
  id: string,
  title: string,
  count: number,
  icon: React.ReactNode,
  iconColor?: string,
  subtitle?: string
): SummaryCard => ({
  id,
  type: 'count',
  title,
  subtitle,
  count,
  icon,
  iconColor,
});

// Create custom card
export const createCustomCard = (
  id: string,
  title: string,
  customContent: React.ReactNode,
  subtitle?: string
): SummaryCard => ({
  id,
  type: 'custom',
  title,
  subtitle,
  customContent,
});

// Predefined transformation functions for common modules

/**
 * Transform Devices API data to SummaryCard[]
 */
export const transformDevicesData = (
  data: {
    totalDevices: number;
    deviceTypes?: Array<{ count: number; value: string; label: string }>;
    statuses?: Array<{ count: number; value: string; label: string }>;
    manufacturerNames?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.devices;

  // Device Types Chart
  if (data.deviceTypes?.length) {
    cards.push(createChartCard(
      'device-types',
      'Device Types',
      data.deviceTypes,
      colorScheme
    ));
  }

  // Status Chart
  if (data.statuses?.length) {
    cards.push(createChartCard(
      'statuses',
      'Device Status',
      data.statuses,
      colorScheme
    ));
  }

  // Top Manufacturers Chart
  if (data.manufacturerNames?.length) {
    const topManufacturers = data.manufacturerNames.slice(0, 5);
    cards.push(createChartCard(
      'manufacturers',
      'Top Manufacturers',
      topManufacturers,
      colorScheme
    ));
  }

  // Total Devices Count
  cards.push(createCountCard(
    'total-devices',
    'Total Devices',
    data.totalDevices,
    icons.totalIcon || React.createElement('div', { children: '📱' }),
    '#1E764E'
  ));

  // Inactive Devices Count
  const inactiveDevices = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  cards.push(createCountCard(
    'inactive-devices',
    'Inactive Devices',
    inactiveDevices,
    icons.inactiveIcon || React.createElement('div', { children: '📴' }),
    '#B00020'
  ));

  return cards;
};


/**
 * Transform Vehicles API data to SummaryCard[]
 */
export const transformVehiclesData = (
  data: {
    totalVehicles: number;
    vehicleTypes?: Array<{ count: number; value: string; label: string }>;
    statuses?: Array<{ count: number; value: string; label: string }>;
    brandNames?: Array<{ count: number; value: string; label: string }>;
    fuelTypes?: Array<{ count: number; value: string; label: string }>;
    locations?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    maintenanceIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.vehicles;

  // Total Vehicles Count
  cards.push(createCountCard(
    'total-vehicles',
    'Total Vehicles',
    data.totalVehicles,
    icons.totalIcon || React.createElement('div', { children: '🚗' }),
    '#2563EB'
  ));

  // Vehicle Types Chart
  if (data.vehicleTypes?.length) {
    cards.push(createChartCard(
      'vehicle-types',
      'Vehicle Types',
      data.vehicleTypes,
      colorScheme,
      `${data.vehicleTypes.length} types`
    ));
  }

  // Status Chart
  if (data.statuses?.length) {
    cards.push(createChartCard(
      'statuses',
      'Vehicle Status',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // Brand Names Chart (Updated to use brandNames instead of fuelTypes)
  if (data.brandNames?.length) {
    const topBrands = data.brandNames.slice(0, 8); // Show top 8 brands
    cards.push(createChartCard(
      'brand-names',
      'Top Brands',
      topBrands,
      colorScheme,
      `${data.brandNames.length} brands`
    ));
  }

  // Fuel Types Chart (if available)
  if (data.fuelTypes?.length) {
    cards.push(createChartCard(
      'fuel-types',
      'Fuel Types',
      data.fuelTypes,
      colorScheme,
      `${data.fuelTypes.length} fuel types`
    ));
  }

  // Maintenance/Inactive Vehicles Count
  const maintenanceVehicles = data.statuses?.find(s => s.value === 'maintenance')?.count || 0;
  const inactiveVehicles = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  
  if (maintenanceVehicles > 0) {
    cards.push(createCountCard(
      'maintenance-vehicles',
      'In Maintenance',
      maintenanceVehicles,
      icons.maintenanceIcon || React.createElement('div', { children: '🔧' }),
      '#D97706'
    ));
  } else if (inactiveVehicles > 0) {
    cards.push(createCountCard(
      'inactive-vehicles',
      'Inactive Vehicles',
      inactiveVehicles,
      icons.maintenanceIcon || React.createElement('div', { children: '🚫' }),
      '#B00020'
    ));
  }

  return cards;
};

/**
 * Transform Drivers API data to SummaryCard[]
 * Updated to match the actual API response structure
 */
export const transformDriversData = (
  data: {
    totalDrivers: number;
    statuses?: Array<{ count: number; value: string; label: string }>;
    names?: Array<{ count: number; value: string; label: string }>;
    // Optional fields that might be added later
    licenseTypes?: Array<{ count: number; value: string; label: string }>;
    experienceLevels?: Array<{ count: number; value: string; label: string }>;
    locations?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    onLeaveIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.drivers;

  // Total Drivers Count
  cards.push(createCountCard(
    'total-drivers',
    'Total Drivers',
    data.totalDrivers,
    icons.totalIcon || React.createElement('div', { children: '👤' }),
    '#2563EB'
  ));

  // Status Chart
  if (data.statuses?.length) {
    cards.push(createChartCard(
      'statuses',
      'Driver Status',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // Driver Names Chart (Top Drivers)
  if (data.names?.length) {
    const topDrivers = data.names.slice(0, 6); // Show top 6 drivers
    cards.push(createChartCard(
      'driver-names',
      'Top Drivers',
      topDrivers,
      colorScheme,
      `${data.names.length} drivers`
    ));
  }

  // License Types Chart (if available in future)
  if (data.licenseTypes?.length) {
    cards.push(createChartCard(
      'license-types',
      'License Types',
      data.licenseTypes,
      colorScheme,
      `${data.licenseTypes.length} types`
    ));
  }

  // Experience Levels Chart (if available in future)
  if (data.experienceLevels?.length) {
    cards.push(createChartCard(
      'experience-levels',
      'Experience Levels',
      data.experienceLevels,
      colorScheme,
      `${data.experienceLevels.length} levels`
    ));
  }

  // Locations Chart (if available in future)
  if (data.locations?.length) {
    const topLocations = data.locations.slice(0, 8);
    cards.push(createChartCard(
      'locations',
      'Locations',
      topLocations,
      colorScheme,
      `${data.locations.length} locations`
    ));
  }

  // Inactive Drivers Count
  const inactiveDrivers = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  if (inactiveDrivers > 0) {
    cards.push(createCountCard(
      'inactive-drivers',
      'Inactive Drivers',
      inactiveDrivers,
      icons.onLeaveIcon || React.createElement('div', { children: '🚫' }),
      '#B00020'
    ));
  }

  return cards;
};
/**
 * Transform Clients API data to SummaryCard[]
 */
export const transformClientsData = (
  data: {
    totalClients: number;
    statuses?: Array<{ count: number; value: string; label: string }>;
    stateNames?: Array<{ count: number; value: string; label: string }>;
    cityNames?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.clients;

  // Total Clients Count
  cards.push(createCountCard(
    'total-clients',
    'Total Clients',
    data.totalClients,
    icons.totalIcon || React.createElement('div', { children: '👥' }),
    '#1E764E'
  ));

  // Status Chart
  if (data.statuses?.length) {
    cards.push(createChartCard(
      'client-statuses',
      'Client Status',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // State Names Chart
  if (data.stateNames?.length) {
    const topStates = data.stateNames.slice(0, 8); // Show top 8 states
    cards.push(createChartCard(
      'state-names',
      'States',
      topStates,
      colorScheme,
      `${data.stateNames.length} states`
    ));
  }

  // City Names Chart
  if (data.cityNames?.length) {
    const topCities = data.cityNames.slice(0, 8); // Show top 8 cities
    cards.push(createChartCard(
      'city-names',
      'Cities',
      topCities,
      colorScheme,
      `${data.cityNames.length} cities`
    ));
  }

  // Inactive Clients Count
  const inactiveClients = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  if (inactiveClients > 0) {
    cards.push(createCountCard(
      'inactive-clients',
      'Inactive Clients',
      inactiveClients,
      icons.inactiveIcon || React.createElement('div', { children: '👥' }),
      '#B00020'
    ));
  }

  return cards;
};

/**
 * Transform Groups API data to SummaryCard[]
 */
export const transformGroupsData = (
  data: {
    totalGroupMasters: number;
    groupTypes?: Array<{ count: number; value: string; label: string }>;
    statuses?: Array<{ count: number; value: string; label: string }>;
    stateNames?: Array<{ count: number; value: string; label: string }>;
    cityNames?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.groups;

  // Total Groups Count
  cards.push(createCountCard(
    'total-groups',
    'Total Groups',
    data.totalGroupMasters,
    icons.totalIcon || React.createElement('div', { children: '👥' }),
    '#1E764E'
  ));

  // Group Types Chart
  if (data.groupTypes?.length) {
    const topGroupTypes = data.groupTypes.slice(0, 8); // Show top 8 group types
    cards.push(createChartCard(
      'group-types',
      'Group Types',
      topGroupTypes,
      colorScheme,
      `${data.groupTypes.length} types`
    ));
  }

  // Status Chart
  if (data.statuses?.length) {
    cards.push(createChartCard(
      'group-statuses',
      'Group Status',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // State Names Chart
  if (data.stateNames?.length) {
    const topStates = data.stateNames.slice(0, 8); // Show top 8 states
    cards.push(createChartCard(
      'state-names',
      'States',
      topStates,
      colorScheme,
      `${data.stateNames.length} states`
    ));
  }

  // City Names Chart
  if (data.cityNames?.length) {
    const topCities = data.cityNames.slice(0, 8); // Show top 8 cities
    cards.push(createChartCard(
      'city-names',
      'Cities',
      topCities,
      colorScheme,
      `${data.cityNames.length} cities`
    ));
  }

  // Inactive Groups Count
  const inactiveGroups = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  if (inactiveGroups > 0) {
    cards.push(createCountCard(
      'inactive-groups',
      'Inactive Groups',
      inactiveGroups,
      icons.inactiveIcon || React.createElement('div', { children: '🚫' }),
      '#B00020'
    ));
  }

  return cards;
};

/**
 * Transform Vehicle Masters API data to SummaryCard[]
 */
export const transformVehicleMastersData = (
  data: {
    totalVehicleMasters: number;
    statuses?: Array<{ count: number; value: string; label: string }>;
    vehicleBrands?: Array<{ count: number; value: string; label: string }>;
    vehicleTypes?: Array<{ count: number; value: string; label: string }>;
    vehicleStatuses?: Array<{ count: number; value: string; label: string }>;
    driverNames?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    driverIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.vehicleMasters;

  // Total Vehicle Masters Count
  cards.push(createCountCard(
    'total-vehicle-masters',
    'Total Vehicle Masters',
    data.totalVehicleMasters,
    icons.totalIcon || React.createElement('div', { children: '🚛' }),
    '#2563EB'
  ));

  // Vehicle Brands Chart
  if (data.vehicleBrands?.length) {
    const topBrands = data.vehicleBrands.slice(0, 8); // Show top 8 brands
    cards.push(createChartCard(
      'vehicle-brands',
      'Vehicle Brands',
      topBrands,
      colorScheme,
      `${data.vehicleBrands.length} brands`
    ));
  }

  // Vehicle Types Chart
  if (data.vehicleTypes?.length) {
    cards.push(createChartCard(
      'vehicle-types',
      'Vehicle Types',
      data.vehicleTypes,
      colorScheme,
      `${data.vehicleTypes.length} types`
    ));
  }

  // Vehicle Statuses Chart (different from main statuses)
  if (data.vehicleStatuses?.length) {
    cards.push(createChartCard(
      'vehicle-statuses',
      'Vehicle Status',
      data.vehicleStatuses,
      colorScheme,
      `${data.vehicleStatuses.length} statuses`
    ));
  }

  // Driver Names Chart
  if (data.driverNames?.length) {
    const topDrivers = data.driverNames.slice(0, 8); // Show top 8 drivers
    cards.push(createChartCard(
      'driver-names',
      'Active Drivers',
      topDrivers,
      colorScheme,
      `${data.driverNames.length} drivers`
    ));
  }

  // Master Status Chart (for vehicle master records)
  if (data.statuses?.length) {
    cards.push(createChartCard(
      'master-statuses',
      'Master Records',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // Inactive Vehicle Masters Count
  const inactiveVehicleMasters = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  if (inactiveVehicleMasters > 0) {
    cards.push(createCountCard(
      'inactive-vehicle-masters',
      'Inactive Masters',
      inactiveVehicleMasters,
      icons.driverIcon || React.createElement('div', { children: '⛔' }),
      '#B00020'
    ));
  }

  return cards;
};

// Add this function at the end of your file (after transformClientsData):
// This is specifically for Groups Master (complex groups with IMEI)

/**
 * Transform Groups Master API data to SummaryCard[]
 * This is for complex groups with IMEI devices and group modules
 */
export const transformGroupsMasterData = (
  data: {
    totalGroups: number;
    groupTypes?: Array<{ count: number; value: string; label: string }>;
    statuses?: Array<{ count: number; value: string; label: string }>;
    stateNames?: Array<{ count: number; value: string; label: string }>;
    cityNames?: Array<{ count: number; value: string; label: string }>;
    deviceCounts?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.groupmaster;

  // Total Groups Count
  cards.push(createCountCard(
    'total-groups-master',
    'Total Groups',
    data.totalGroups,
    icons.totalIcon || React.createElement('div', { children: '👥' }),
    '#1E764E'
  ));

  // Group Types Chart
  if (data.groupTypes?.length) {
    const topGroupTypes = data.groupTypes.slice(0, 8); // Show top 8 group types
    cards.push(createChartCard(
      'groupmaster-types',
      'Group Types',
      topGroupTypes,
      colorScheme,
      `${data.groupTypes.length} types`
    ));
  }

  // Status Chart
  if (data.statuses?.length) {
    cards.push(createChartCard(
      'groupmaster-statuses',
      'Group Status',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // State Names Chart
  if (data.stateNames?.length) {
    const topStates = data.stateNames.slice(0, 8); // Show top 8 states
    cards.push(createChartCard(
      'groupmaster-states',
      'States',
      topStates,
      colorScheme,
      `${data.stateNames.length} states`
    ));
  }

  // City Names Chart
  if (data.cityNames?.length) {
    const topCities = data.cityNames.slice(0, 8); // Show top 8 cities
    cards.push(createChartCard(
      'groupmaster-cities',
      'Cities',
      topCities,
      colorScheme,
      `${data.cityNames.length} cities`
    ));
  }

  // Device Counts Chart (showing top devices by IMEI)
  if (data.deviceCounts?.length) {
    const topDevices = data.deviceCounts.slice(0, 6); // Show top 6 devices
    cards.push(createChartCard(
      'groupmaster-devices',
      'Top Assets/IMEI',
      topDevices,
      colorScheme,
      `${data.deviceCounts.length} devices`
    ));
  }

  // Inactive Groups Count
  const inactiveGroups = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  if (inactiveGroups > 0) {
    cards.push(createCountCard(
      'inactive-groups-master',
      'Inactive Groups',
      inactiveGroups,
      icons.inactiveIcon || React.createElement('div', { children: '👥' }),
      '#B00020'
    ));
  }

  return cards;
};



/**
 * Transform Users API data to SummaryCard[]
 */
export const transformUsersData = (
  data: {
    totalUsers: number;
    statuses?: Array<{ count: number; value: string; label: string }>;
    accountNames?: Array<{ count: number; value: string; label: string }>;
    groupNames?: Array<{ count: number; value: string; label: string }>;
    roleNames?: Array<{ count: number; value: string; label: string }>;
    twoFAStatuses?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
    adminIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.users;

  // Total Users Count
  cards.push(createCountCard(
    'total-users',
    'Total Users',
    data.totalUsers,
    icons.totalIcon || React.createElement('div', { children: '👥' }),
    '#1E764E'
  ));

  // Status Chart
  if (data.statuses && data.statuses.length > 0) {
    cards.push(createChartCard(
      'user-statuses',
      'User Status',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // Account Names Chart (if available)
  if (data.accountNames && data.accountNames.length > 0) {
    const topAccounts = data.accountNames.slice(0, 6); // Show top 6 accounts
    cards.push(createChartCard(
      'account-names',
      'Accounts',
      topAccounts,
      colorScheme,
      `${data.accountNames.length} accounts`
    ));
  }

  // Role Names Chart
  if (data.roleNames && data.roleNames.length > 0) {
    cards.push(createChartCard(
      'role-names',
      'User Roles',
      data.roleNames,
      colorScheme,
      `${data.roleNames.length} roles`
    ));
  }

  // Two-Factor Authentication Status Chart
  if (data.twoFAStatuses && data.twoFAStatuses.length > 0) {
    cards.push(createChartCard(
      'two-fa-statuses',
      '2FA Status',
      data.twoFAStatuses,
      colorScheme,
      '2FA distribution'
    ));
  }

  // Group Names Chart (if available and not empty)
  if (data.groupNames && data.groupNames.length > 0) {
    const topGroups = data.groupNames.slice(0, 6); // Show top 6 groups
    cards.push(createChartCard(
      'group-names',
      'Groups',
      topGroups,
      colorScheme,
      `${data.groupNames.length} groups`
    ));
  }

  // Inactive Users Count
  const inactiveUsers = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  if (inactiveUsers > 0) {
    cards.push(createCountCard(
      'inactive-users',
      'Inactive Users',
      inactiveUsers,
      icons.inactiveIcon || React.createElement('div', { children: '👤' }),
      '#B00020'
    ));
  }

  // Admin Users Count (if role data available)
  const adminUsers = data.roleNames?.find(r => r.value.toLowerCase() === 'admin')?.count || 0;
  if (adminUsers > 0) {
    cards.push(createCountCard(
      'admin-users',
      'Admin Users',
      adminUsers,
      icons.adminIcon || React.createElement('div', { children: '🛡️' }),
      '#DC2626'
    ));
  }

  return cards;
};


/**
 * Transform Device Onboarding API data to SummaryCard[]
 */
export const transformDeviceOnboardingData = (
  data: {
    totalDevices: number;
    statuses?: Array<{ count: number; value: string; label: string }>;
    accountNames?: Array<{ count: number; value: string; label: string }>;
    vehicleNumbers?: Array<{ count: number; value: string; label: string }>;
    driverNames?: Array<{ count: number; value: string; label: string }>;
    deviceTypes?: Array<{ count: number; value: string; label: string }>;
    telecomOperators?: Array<{ count: number; value: string; label: string }>;
    mobileNumbers?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES['device-onboarding'];

  // Total Devices Count
  cards.push(createCountCard(
    'total-devices',
    'Total Devices',
    data.totalDevices,
    icons.totalIcon || React.createElement('div', { children: '📱' }),
    '#1E764E'
  ));

  // Device Types Chart
  if (data.deviceTypes?.length) {
    cards.push(createChartCard(
      'device-types',
      'Device Types',
      data.deviceTypes,
      colorScheme,
      `${data.deviceTypes.length} types`
    ));
  }

  // Status Chart
  if (data.statuses?.length) {
    cards.push(createChartCard(
      'statuses',
      'Device Status',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // Account Names Chart
  if (data.accountNames?.length) {
    const topAccounts = data.accountNames.slice(0, 6); // Show top 6 accounts
    cards.push(createChartCard(
      'account-names',
      'Accounts',
      topAccounts,
      colorScheme,
      `${data.accountNames.length} accounts`
    ));
  }

  // Vehicle Numbers Chart
  if (data.vehicleNumbers?.length) {
    const topVehicles = data.vehicleNumbers.slice(0, 6); // Show top 6 vehicles
    cards.push(createChartCard(
      'vehicle-numbers',
      'Vehicle Numbers',
      topVehicles,
      colorScheme,
      `${data.vehicleNumbers.length} vehicles`
    ));
  }

  // Driver Names Chart
  if (data.driverNames?.length) {
    const topDrivers = data.driverNames.slice(0, 6); // Show top 6 drivers
    cards.push(createChartCard(
      'driver-names',
      'Drivers',
      topDrivers,
      colorScheme,
      `${data.driverNames.length} drivers`
    ));
  }

  // Telecom Operators Chart
  if (data.telecomOperators?.length) {
    cards.push(createChartCard(
      'telecom-operators',
      'Telecom Operators',
      data.telecomOperators,
      colorScheme,
      `${data.telecomOperators.length} operators`
    ));
  }

  // Mobile Numbers Chart (show only top 5 due to space)
  if (data.mobileNumbers?.length) {
    const topMobileNumbers = data.mobileNumbers.slice(0, 5);
    cards.push(createChartCard(
      'mobile-numbers',
      'Mobile Numbers',
      topMobileNumbers,
      colorScheme,
      `${data.mobileNumbers.length} numbers`
    ));
  }

  // Inactive Devices Count
  const inactiveDevices = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  if (inactiveDevices > 0) {
    cards.push(createCountCard(
      'inactive-devices',
      'Inactive Devices',
      inactiveDevices,
      icons.inactiveIcon || React.createElement('div', { children: '📴' }),
      '#B00020'
    ));
  }

  return cards;
};


/**
 * Transform Accounts API data to SummaryCard[]
 */
export const transformAccountsData = (
  data: {
    totalAccounts: number;
    statuses?: Array<{ count: number; value: string; label: string }>;
    levels?: Array<{ count: number; value: number; label: number }>;
    accountNames?: Array<{ count: number; value: string; label: string }>;
  },
  icons: {
    totalIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
  } = {}
): SummaryCard[] => {
  const cards: SummaryCard[] = [];
  const colorScheme = COLOR_SCHEMES.accounts;

  // Total Accounts Count
  cards.push(createCountCard(
    'total-accounts',
    'Total Accounts',
    data.totalAccounts,
    icons.totalIcon || React.createElement('div', { children: '🏢' }),
    '#1E764E'
  ));

  // Status Chart
  if (data.statuses && data.statuses.length > 0) {
    cards.push(createChartCard(
      'account-statuses',
      'Account Status',
      data.statuses,
      colorScheme,
      `${data.statuses.length} statuses`
    ));
  }

  // Account Levels Chart
  if (data.levels && data.levels.length > 0) {
    // Transform levels data to match the expected format
    const levelsData = data.levels.map(item => ({
      count: item.count,
      value: `level_${item.value}`,
      label: `Level ${item.value}`,
    }));

    cards.push(createChartCard(
      'account-levels',
      'Hierarchy Levels',
      levelsData,
      colorScheme,
      `${data.levels.length} levels`
    ));
  }

  // Account Names Chart (Top accounts)
  if (data.accountNames && data.accountNames.length > 0) {
    const topAccounts = data.accountNames.slice(0, 6); // Show top 6 accounts
    cards.push(createChartCard(
      'account-names',
      'Account Distribution',
      topAccounts,
      colorScheme,
      `${data.accountNames.length} accounts`
    ));
  }

  // Inactive Accounts Count
  const inactiveAccounts = data.statuses?.find(s => s.value === 'inactive')?.count || 0;
  if (inactiveAccounts > 0) {
    cards.push(createCountCard(
      'inactive-accounts',
      'Inactive Accounts',
      inactiveAccounts,
      icons.inactiveIcon || React.createElement('div', { children: '🏢' }),
      '#B00020'
    ));
  }

  return cards;
};

/**
 * Generic transformer - you can use this for any custom data structure
 */
export const createGenericTransformer = <T>(
  transformer: (data: T) => SummaryCard[]
) => transformer;