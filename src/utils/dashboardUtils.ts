import { MonitoringResponse } from "../pages/Modules/Dashboard/services/monitoring.services";

// Type guards for safe property access
export const isValidMonitoringData = (data: MonitoringResponse | null): data is MonitoringResponse => {
  return data !== null && data !== undefined;
};

export const hasValidSummary = (data: MonitoringResponse | null): boolean => {
  return isValidMonitoringData(data) && data.summary !== null && data.summary !== undefined;
};

export const hasValidDevices = (data: MonitoringResponse | null): boolean => {
  return (
    isValidMonitoringData(data) && 
    data.devices !== null && 
    data.devices !== undefined && 
    Array.isArray(data.devices) && 
    data.devices.length > 0
  );
};

export const hasValidPerformance = (data: MonitoringResponse | null): boolean => {
  return isValidMonitoringData(data) && data.performance !== null && data.performance !== undefined;
};

export const hasValidPagination = (data: MonitoringResponse | null): boolean => {
  return isValidMonitoringData(data) && data.pagination !== null && data.pagination !== undefined;
};

export const hasValidDebug = (data: MonitoringResponse | null): boolean => {
  return (
    isValidMonitoringData(data) && 
    data.debug !== null && 
    data.debug !== undefined &&
    data.debug.cacheSettings !== null &&
    data.debug.cacheSettings !== undefined
  );
};

// Safe getters with defaults
export const getSafeValue = (value: number | undefined | null, defaultValue: number = 0): number => {
  return value ?? defaultValue;
};

export const getSafeString = (value: string | undefined | null, defaultValue: string = ''): string => {
  return value ?? defaultValue;
};

export const getSafeBoolean = (value: boolean | undefined | null, defaultValue: boolean = false): boolean => {
  return value ?? defaultValue;
};

// Dashboard-specific safe data extractors
export const getSafeSummaryData = (data: MonitoringResponse | null) => {
  if (!hasValidSummary(data)) {
    return {
      totalDevices: 0,
      onlineCount: 0,
      offlineCount: 0,
      haltCount: 0,
      motionCount: 0,
      idleCount: 0,
      neverConnectedCount: 0,
    };
  }

  const summary = data!.summary;
  return {
    totalDevices: getSafeValue(summary.totalDevices),
    onlineCount: getSafeValue(summary.onlineCount),
    offlineCount: getSafeValue(summary.offlineCount),
    haltCount: getSafeValue(summary.haltCount),
    motionCount: getSafeValue(summary.motionCount),
    idleCount: getSafeValue(summary.idleCount),
    neverConnectedCount: getSafeValue(summary.neverConnectedCount),
  };
};

export const getSafePerformanceData = (data: MonitoringResponse | null) => {
  if (!hasValidPerformance(data)) {
    return {
      responseTime: 0,
      cacheHitRate: 0,
      freshDataFetched: 0,
      cacheAge: 0,
      autoRefreshed: false,
    };
  }

  const performance = data!.performance;
  return {
    responseTime: getSafeValue(performance.responseTime),
    cacheHitRate: getSafeValue(performance.cacheHitRate),
    freshDataFetched: getSafeValue(performance.freshDataFetched),
    cacheAge: getSafeValue(performance.cacheAge),
    autoRefreshed: getSafeBoolean(performance.autoRefreshed),
  };
};

export const getSafePaginationData = (data: MonitoringResponse | null) => {
  if (!hasValidPagination(data)) {
    return {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const pagination = data!.pagination;
  return {
    currentPage: getSafeValue(pagination.currentPage, 1),
    totalPages: getSafeValue(pagination.totalPages, 1),
    totalItems: getSafeValue(pagination.totalItems),
    itemsPerPage: getSafeValue(pagination.itemsPerPage, 10),
    hasNextPage: getSafeBoolean(pagination.hasNextPage),
    hasPrevPage: getSafeBoolean(pagination.hasPrevPage),
  };
};

export const getSafeCacheData = (data: MonitoringResponse | null) => {
  if (!hasValidDebug(data)) {
    return {
      ttlSeconds: 0,
      maxAgeMinutes: 0,
      onlineThresholdMinutes: 0,
    };
  }

  const cacheSettings = data!.debug.cacheSettings;
  return {
    ttlSeconds: getSafeValue(cacheSettings.ttlSeconds),
    maxAgeMinutes: getSafeValue(cacheSettings.maxAgeMinutes),
    onlineThresholdMinutes: getSafeValue(cacheSettings.onlineThresholdMinutes),
  };
};