import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomInput from "../../../../components/ui/CustomInput";
import Select from "../../../../components/ui/Select";
import Card from "../../../../components/ui/Card";
import {
  AlertConfig,
  AlertCriteria,
  Notifications,
  ContactDetails,
  Geofence,
  Route,
  alertServices,
} from "../services/alerts.services";

interface AlertConfigurationTabsProps {
  category: "fuel" | "load" | "elock" | "tracker";
  selectedImeis: string[];
  alertConfigs: AlertConfig[];
  onConfigsChange: (configs: AlertConfig[]) => void;
  disabled?: boolean;
}

interface TrackerUIState {
  [key: string]: {
    selectedAlerts: string[];
    geofenceIn: boolean;
    geofenceOut: boolean;
    selectedGeofences: string[];
    speedThreshold: string;
    stoppageThreshold: string;
    deviationThreshold: string;
    selectedRoutes: string[];
  };
}
const AlertConfigurationTabs: React.FC<AlertConfigurationTabsProps> = ({
  category,
  selectedImeis,
  alertConfigs,
  onConfigsChange,
  disabled = false,
}) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trackerUIState, setTrackerUIState] = useState<TrackerUIState>({});

  console.log({ routes });
  const [activeTab, setActiveTab] = useState<
    "fuel" | "load" | "elock" | "tracker"
  >(category);

  const tabs = [
    { id: "fuel", label: "Fuel", icon: "⛽" },
    { id: "load", label: "Load", icon: "📦" },
    { id: "elock", label: "E-Lock", icon: "🔒" },
    { id: "tracker", label: "Tracker", icon: "📍" },
  ];

  const alertPriorityOptions = [
    { value: "none", label: "None (Logs only)" },
    { value: "low", label: "Low (Logs only)" },
    { value: "mid", label: "Mid (Logs + Push + Trigger)" },
    { value: "high", label: "High (All + IVR + Acknowledgement)" },
  ];

  const notificationTypeOptions = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "telegram", label: "Telegram" },
  ];

  const getTrackerAlertOptions = () => [
    { value: "geofence", label: "Geofence" },
    { value: "overspeed", label: "Overspeed" },
    { value: "overstoppage", label: "Overstoppage" },
    { value: "ignition", label: "Ignition" },
    { value: "routeDeviation", label: "Route Deviation" },
  ];

  // Initialize configs for selected IMEIs
  useEffect(() => {
    const updatedConfigs = selectedImeis.map((imei, index) => {
      const existingConfig = alertConfigs.find(
        (config) => config.imei === imei
      );
      if (existingConfig) {
        return existingConfig;
      }

      return createDefaultConfig(imei, index + 1);
    });

    onConfigsChange(updatedConfigs);
  }, [selectedImeis]);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [geofencesData, routesData] = await Promise.all([
          alertServices.getGeofences(),
          alertServices.getRoutes(),
        ]);
        setGeofences(geofencesData);
        setRoutes(routesData);
      } catch (error) {
        console.error("Error loading geofences and routes:", error);
      }
    };
    loadDropdownData();
  }, []);

  // Add this useEffect to initialize tracker UI state from existing data
  useEffect(() => {
    if (category === "tracker" && alertConfigs.length > 0) {
      const newTrackerUIState: TrackerUIState = {};

      alertConfigs.forEach((config) => {
        // Derive selectedAlerts from alertName array and enabled criteria
        const selectedAlerts = deriveSelectedAlertsFromConfig(config);

        newTrackerUIState[config.imei] = {
          selectedAlerts: selectedAlerts,
          geofenceIn:
            config.alertCriteria.geofence?.geofenceList?.some((g) => g.in) ||
            false,
          geofenceOut:
            config.alertCriteria.geofence?.geofenceList?.some((g) => g.out) ||
            false,
          selectedGeofences: extractGeofenceIds(config.alertCriteria.geofence),
          speedThreshold:
            extractSpeedValue(config.alertCriteria.overspeed?.threshold) || "",
          stoppageThreshold:
            extractTimeValue(config.alertCriteria.overStoppage?.threshold) ||
            "",
          deviationThreshold:
            extractDistanceValue(
              config.alertCriteria.routeDeviation?.threshold
            ) || "",
          selectedRoutes: config.alertCriteria.routeDeviation?.routeList || [],
        };
      });

      setTrackerUIState(newTrackerUIState);
    }
  }, [alertConfigs, category]);

  const deriveSelectedAlertsFromConfig = (config: AlertConfig): string[] => {
    const selectedAlerts: string[] = [];

    // Check which alerts are enabled and add them to selectedAlerts
    if (config.alertCriteria.geofence?.enabled) {
      selectedAlerts.push("geofence");
    }
    if (config.alertCriteria.overspeed?.enabled) {
      selectedAlerts.push("overspeed");
    }
    if (config.alertCriteria.overStoppage?.enabled) {
      selectedAlerts.push("overstoppage");
    }
    if (config.alertCriteria.ignition?.enabled) {
      selectedAlerts.push("ignition");
    }
    if (config.alertCriteria.routeDeviation?.enabled) {
      selectedAlerts.push("routeDeviation");
    }

    return selectedAlerts;
  };

  // Add helper functions to extract values
  const extractGeofenceIds = (geofence: any): string[] => {
    if (!geofence?.geofenceList) return [];
    const ids: string[] = [];
    geofence.geofenceList.forEach((g: any) => {
      if (g.geofenceInList) ids.push(...g.geofenceInList);
      if (g.geofenceOutList) ids.push(...g.geofenceOutList);
    });
    return ids;
  };

  const extractSpeedValue = (threshold?: string): string => {
    return threshold ? threshold.replace("km/h", "") : "";
  };

  const extractTimeValue = (threshold?: string): string => {
    if (!threshold) return "";
    return threshold.replace("min", "");
  };

  const extractDistanceValue = (threshold?: string): string => {
    return threshold ? threshold.replace("m", "") : "";
  };

  const createDefaultConfig = (imei: string, sno: number): AlertConfig => ({
    sno,
    imei,
    alertName: category === "tracker" ? [] : `Alert for ${imei}`, // Keep array for tracker
    alertDescription: `Default alert description for ${imei}`,
    alertEnable: true,
    alertCriteria: getDefaultCriteria(category),
    alertPriority: "none",
    notifications: {
      logs: true,
      push: false,
      trigger: false,
      whatsapp: false,
      email: false,
      sms: false,
      telegram: false,
      ivr: false,
      acknowledgement: false,
    },
    contactDetails: {
      whatsappContacts: [],
      emailContacts: [],
      smsContacts: [],
      telegramContacts: [],
      ivrContacts: [],
    },
    template: "logs_only",
  });

  const getDefaultCriteria = (cat: string): AlertCriteria => {
    const baseCriteria = {
      lock: false,
      unlock: false,
      ignitionOn: false,
      ignitionOff: false,
      speeding: false,

      fuelLow: false,
      fuelTheft: false,
      fuelRefill: false,
      fuelDrain: false,
    };

    switch (cat) {
      case "fuel":
        return { ...baseCriteria, fuelLow: true, fuelTheft: true };
      case "load":
        return { ...baseCriteria, speeding: true };
      case "elock":
        return { ...baseCriteria, lock: true, unlock: true };
      default:
        return baseCriteria;
    }
  };

  const updateConfigField = (
    index: number,
    field: keyof AlertConfig,
    value: any
  ) => {
    const updatedConfigs = [...alertConfigs];
    updatedConfigs[index] = {
      ...updatedConfigs[index],
      [field]: value,
    };
    onConfigsChange(updatedConfigs);
  };

  const updateConfigCriteria = (
    index: number,
    criteriaField: keyof AlertCriteria,
    value: boolean
  ) => {
    const updatedConfigs = [...alertConfigs];
    updatedConfigs[index] = {
      ...updatedConfigs[index],
      alertCriteria: {
        ...updatedConfigs[index].alertCriteria,
        [criteriaField]: value,
      },
    };
    onConfigsChange(updatedConfigs);
  };

  const updateNotifications = (
    index: number,
    notificationField: keyof Notifications,
    value: boolean
  ) => {
    const updatedConfigs = [...alertConfigs];
    const currentNotifications = updatedConfigs[index].notifications;

    // Update the specific notification field
    const newNotifications = {
      ...currentNotifications,
      [notificationField]: value,
    };

    updatedConfigs[index] = {
      ...updatedConfigs[index],
      notifications: newNotifications,
    };

    onConfigsChange(updatedConfigs);
  };

  const addContact = (index: number, contactType: keyof ContactDetails) => {
    const updatedConfigs = [...alertConfigs];
    const contactDetails = updatedConfigs[index].contactDetails;

    if (
      contactType === "whatsappContacts" ||
      contactType === "smsContacts" ||
      contactType === "ivrContacts"
    ) {
      contactDetails[contactType].push({
        name: "",
        number: "",
        countryCode: "+91",
      });
    } else if (contactType === "emailContacts") {
      contactDetails[contactType].push({
        name: "",
        email: "",
      });
    } else if (contactType === "telegramContacts") {
      contactDetails[contactType].push({
        name: "",
        username: "",
        chatId: "",
      });
    }

    updatedConfigs[index] = {
      ...updatedConfigs[index],
      contactDetails,
    };
    onConfigsChange(updatedConfigs);
  };

  const removeContact = (
    index: number,
    contactType: keyof ContactDetails,
    contactIndex: number
  ) => {
    const updatedConfigs = [...alertConfigs];
    const contactDetails: any = updatedConfigs[index]?.contactDetails;
    contactDetails[contactType].splice(contactIndex, 1);

    updatedConfigs[index] = {
      ...updatedConfigs[index],
      contactDetails,
    };
    onConfigsChange(updatedConfigs);
  };

  const getCriteriaOptions = (cat: string) => {
    const allCriteria = [
      { key: "lock", label: "Lock" },
      { key: "unlock", label: "Unlock" },
      { key: "ignitionOn", label: "Ignition On" },
      { key: "ignitionOff", label: "Ignition Off" },
      { key: "speeding", label: "Speeding" },
      // { key: "geofence", label: "Geofence" },
      { key: "fuelLow", label: "Fuel Low" },
      { key: "fuelTheft", label: "Fuel Theft" },
      { key: "fuelRefill", label: "Fuel Refill" },
      { key: "fuelDrain", label: "Fuel Drain" },
    ];

    switch (cat) {
      case "fuel":
        return allCriteria.filter((c) =>
          ["fuelLow", "fuelTheft", "fuelRefill", "fuelDrain"].includes(c.key)
        );
      case "load":
        return allCriteria.filter((c) =>
          ["speeding", "geofence", "ignitionOn", "ignitionOff"].includes(c.key)
        );
      case "elock":
        return allCriteria.filter((c) =>
          ["lock", "unlock", "ignitionOn", "ignitionOff"].includes(c.key)
        );
      default:
        return allCriteria;
    }
  };

  const handlePriorityChange = (
    index: number,
    priority: "none" | "low" | "mid" | "high"
  ) => {
    const updatedConfigs = [...alertConfigs];

    // Update priority
    updatedConfigs[index].alertPriority = priority;

    // Update notifications based on priority
    let newNotifications = { ...updatedConfigs[index].notifications };

    if (priority === "none" || priority === "low") {
      newNotifications = {
        logs: true,
        push: false,
        trigger: false,
        whatsapp: false,
        email: false,
        sms: false,
        telegram: false,
        ivr: false,
        acknowledgement: false,
      };
    } else if (priority === "mid") {
      newNotifications = {
        ...newNotifications,
        logs: true,
        push: true,
        trigger: true,
        ivr: false, // Explicitly set to false for mid
        acknowledgement: false, // Explicitly set to false for mid
      };
    } else if (priority === "high") {
      newNotifications = {
        ...newNotifications,
        logs: true,
        push: true,
        trigger: true,
        ivr: true, // Available for high
        acknowledgement: true, // Available for high
      };
    }

    updatedConfigs[index].notifications = newNotifications;
    onConfigsChange(updatedConfigs);
  };

  const geofenceOptions = geofences.map((geofence) => ({
    value: geofence._id,
    label: `${geofence.name} - ${geofence.finalAddress}`,
  }));

  const routeOptions = routes.map((route) => ({
    value: route._id,
    label: `${route.name} (${route.distance.text})`,
  }));
  console.log({ routeOptions });
  const updateAdvancedCriteria = (
    index: number,
    criteriaType: keyof AlertCriteria,
    field: string,
    value: any
  ) => {
    const updatedConfigs: any = [...alertConfigs];
    if (!updatedConfigs[index].alertCriteria[criteriaType]) {
      updatedConfigs[index].alertCriteria[criteriaType] = {} as any;
    }
    (updatedConfigs[index].alertCriteria[criteriaType] as any)[field] = value;
    onConfigsChange(updatedConfigs);
  };

  const updateTrackerCriteria = (
    index: number,
    selectedAlerts: string[],
    config: AlertConfig
  ) => {
    const updatedConfigs = [...alertConfigs];
    const alertCriteria = { ...updatedConfigs[index].alertCriteria };

    selectedAlerts.forEach((alertType) => {
      switch (alertType) {
        case "geofence":
          alertCriteria.geofence = {
            enabled: true,
            geofenceList: [],
          };
          break;
        case "overspeed":
          alertCriteria.overspeed = {
            enabled: true,
            threshold: "",
          };
          break;
        case "overstoppage":
          alertCriteria.overStoppage = {
            enabled: true,
            threshold: "",
          };
          break;
        case "ignition":
          alertCriteria.ignition = {
            enabled: true,
            on: true,
            off: true,
          };
          break;
        case "routeDeviation":
          alertCriteria.routeDeviation = {
            enabled: true,
            threshold: "",
            routeList: [],
          };
          break;
      }
    });

    updatedConfigs[index].alertCriteria = alertCriteria;
    onConfigsChange(updatedConfigs);
  };

  const getTrackerUIState = (imei: string) => {
    return (
      trackerUIState[imei] || {
        selectedAlerts: [],
        geofenceIn: false,
        geofenceOut: false,
        selectedGeofences: [],
        speedThreshold: "",
        stoppageThreshold: "",
        deviationThreshold: "",
        selectedRoutes: [],
      }
    );
  };

  const updateTrackerUIState = (imei: string, field: string, value: any) => {
    setTrackerUIState((prev) => ({
      ...prev,
      [imei]: {
        ...getTrackerUIState(imei),
        [field]: value,
      },
    }));
  };

  const updateGeofenceCriteria = (
    index: number,
    selectedGeofences: string[],
    uiState: any
  ) => {
    const updatedConfigs = [...alertConfigs];
    const geofenceList = [];

    if (uiState.geofenceIn) {
      geofenceList.push({
        in: true,
        geofenceInList: selectedGeofences,
      });
    }

    if (uiState.geofenceOut) {
      geofenceList.push({
        out: true,
        geofenceOutList: selectedGeofences,
      });
    }

    if (!updatedConfigs[index].alertCriteria.geofence) {
      updatedConfigs[index].alertCriteria.geofence = {
        enabled: true,
        geofenceList: [],
      };
    }

    updatedConfigs[index].alertCriteria.geofence!.geofenceList = geofenceList;
    onConfigsChange(updatedConfigs);
  };
  return (
    <Card>
      <Card.Body className="p-0">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "fuel" | "load" | "elock" | "tracker")
                }
                disabled={disabled}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {alertConfigs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Select IMEIs to configure alerts
            </div>
          ) : (
            <div className="space-y-6">
              {alertConfigs.map((config: any, index: any) => (
                <div
                  key={config.imei}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Serial No
                      </label>
                      <input
                        type="number"
                        value={config.sno}
                        onChange={(e) =>
                          updateConfigField(
                            index,
                            "sno",
                            parseInt(e.target.value)
                          )
                        }
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IMEI
                      </label>
                      <input
                        type="text"
                        value={config.imei}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>

                    {/* <div>
                      <CustomInput
                        label="Alert Name"
                        value={config.alertName}
                        onChange={(e) =>
                          updateConfigField(index, "alertName", e.target.value)
                        }
                        disabled={disabled}
                        placeholder="Enter alert name"
                      />
                    </div> */}

                    <div className="md:col-span-2">
                      <CustomInput
                        label="Alert Description"
                        value={config.alertDescription}
                        onChange={(e) =>
                          updateConfigField(
                            index,
                            "alertDescription",
                            e.target.value
                          )
                        }
                        disabled={disabled}
                        placeholder="Enter alert description"
                      />
                    </div>

                    <div>
                      <Select
                        label="Alert Priority"
                        options={alertPriorityOptions}
                        value={config.alertPriority}
                        onChange={(value) =>
                          handlePriorityChange(
                            index,
                            value as "none" | "low" | "mid" | "high"
                          )
                        }
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  {/* Alert Criteria */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Alert Criteria
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {getCriteriaOptions(activeTab).map((criteria) => (
                        <label
                          key={criteria.key}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={
                              config.alertCriteria[
                                criteria.key as keyof AlertCriteria
                              ]
                            }
                            onChange={(e) =>
                              updateConfigCriteria(
                                index,
                                criteria.key as keyof AlertCriteria,
                                e.target.checked
                              )
                            }
                            disabled={disabled}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">
                            {criteria.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {activeTab === "tracker" && (
                    <div className="space-y-6">
                      {/* Alert Name Selection */}
                      <div>
                        <Select
                          label="Select Alert Names"
                          options={getTrackerAlertOptions()}
                          value={getTrackerUIState(config.imei).selectedAlerts}
                          onChange={(value) => {
                            const selectedAlerts = value as string[];
                            updateTrackerUIState(
                              config.imei,
                              "selectedAlerts",
                              selectedAlerts
                            );
                            // Update the actual alertName in config
                            updateConfigField(
                              index,
                              "alertName",
                              selectedAlerts
                            );
                            // Update criteria based on selection
                            updateTrackerCriteria(
                              index,
                              selectedAlerts,
                              config
                            );
                          }}
                          placeholder="Select multiple alerts..."
                          multiple
                          disabled={disabled}
                        />
                      </div>

                      {/* Geofence Configuration */}
                      {getTrackerUIState(config.imei).selectedAlerts.includes(
                        "geofence"
                      ) && (
                        <Card className="p-4 border-l-4 border-blue-500">
                          <h5 className="font-medium mb-3">
                            Geofence Configuration
                          </h5>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={
                                  config.alertCriteria.geofence?.enabled ||
                                  false
                                }
                                onChange={(e) =>
                                  updateAdvancedCriteria(
                                    index,
                                    "geofence",
                                    "enabled",
                                    e.target.checked
                                  )
                                }
                                disabled={disabled}
                              />
                              <span>Enable Geofence Alert</span>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    getTrackerUIState(config.imei).geofenceIn
                                  }
                                  onChange={(e) =>
                                    updateTrackerUIState(
                                      config.imei,
                                      "geofenceIn",
                                      e.target.checked
                                    )
                                  }
                                  disabled={disabled}
                                />
                                <span>Geofence In</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    getTrackerUIState(config.imei).geofenceOut
                                  }
                                  onChange={(e) =>
                                    updateTrackerUIState(
                                      config.imei,
                                      "geofenceOut",
                                      e.target.checked
                                    )
                                  }
                                  disabled={disabled}
                                />
                                <span>Geofence Out</span>
                              </label>
                            </div>

                            <Select
                              label="Select Geofences"
                              options={geofenceOptions}
                              value={
                                getTrackerUIState(config.imei).selectedGeofences
                              }
                              onChange={(value) => {
                                updateTrackerUIState(
                                  config.imei,
                                  "selectedGeofences",
                                  value as string[]
                                );
                                // Update the actual criteria
                                updateGeofenceCriteria(
                                  index,
                                  value as string[],
                                  getTrackerUIState(config.imei)
                                );
                              }}
                              placeholder="Select geofences..."
                              multiple
                              disabled={disabled}
                            />
                          </div>
                        </Card>
                      )}

                      {/* Overspeed Configuration */}
                      {getTrackerUIState(config.imei).selectedAlerts.includes(
                        "overspeed"
                      ) && (
                        <Card className="p-4 border-l-4 border-red-500">
                          <h5 className="font-medium mb-3">
                            Overspeed Configuration
                          </h5>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={
                                  config.alertCriteria.overspeed?.enabled ||
                                  false
                                }
                                onChange={(e) =>
                                  updateAdvancedCriteria(
                                    index,
                                    "overspeed",
                                    "enabled",
                                    e.target.checked
                                  )
                                }
                                disabled={disabled}
                              />
                              <span>Enable Overspeed Alert</span>
                            </label>

                            <CustomInput
                              label="Speed Threshold (km/h)"
                              type="number"
                              value={
                                getTrackerUIState(config.imei).speedThreshold
                              }
                              onChange={(e) => {
                                const threshold = e.target.value;
                                updateTrackerUIState(
                                  config.imei,
                                  "speedThreshold",
                                  threshold
                                );
                                updateAdvancedCriteria(
                                  index,
                                  "overspeed",
                                  "threshold",
                                  `${threshold}km/h`
                                );
                              }}
                              placeholder="Enter speed limit"
                              disabled={disabled}
                            />
                          </div>
                        </Card>
                      )}

                      {/* Overstoppage Configuration */}
                      {getTrackerUIState(config.imei).selectedAlerts.includes(
                        "overstoppage"
                      ) && (
                        <Card className="p-4 border-l-4 border-yellow-500">
                          <h5 className="font-medium mb-3">
                            Overstoppage Configuration
                          </h5>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={
                                  config.alertCriteria.overStoppage?.enabled ||
                                  false
                                }
                                onChange={(e) =>
                                  updateAdvancedCriteria(
                                    index,
                                    "overStoppage",
                                    "enabled",
                                    e.target.checked
                                  )
                                }
                                disabled={disabled}
                              />
                              <span>Enable Overstoppage Alert</span>
                            </label>

                            <CustomInput
                              label="Time Threshold (minutes)"
                              type="number"
                              value={
                                getTrackerUIState(config.imei).stoppageThreshold
                              }
                              onChange={(e) => {
                                const threshold = e.target.value;
                                updateTrackerUIState(
                                  config.imei,
                                  "stoppageThreshold",
                                  threshold
                                );
                                updateAdvancedCriteria(
                                  index,
                                  "overStoppage",
                                  "threshold",
                                  `${threshold}min`
                                );
                              }}
                              placeholder="Enter time in minutes"
                              disabled={disabled}
                            />
                          </div>
                        </Card>
                      )}

                      {/* Route Deviation Configuration */}
                      {getTrackerUIState(config.imei).selectedAlerts.includes(
                        "routeDeviation"
                      ) && (
                        <Card className="p-4 border-l-4 border-purple-500">
                          <h5 className="font-medium mb-3">
                            Route Deviation Configuration
                          </h5>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={
                                  config.alertCriteria.routeDeviation
                                    ?.enabled || false
                                }
                                onChange={(e) =>
                                  updateAdvancedCriteria(
                                    index,
                                    "routeDeviation",
                                    "enabled",
                                    e.target.checked
                                  )
                                }
                                disabled={disabled}
                              />
                              <span>Enable Route Deviation Alert</span>
                            </label>

                            <CustomInput
                              label="Distance Threshold (meters)"
                              type="number"
                              value={
                                getTrackerUIState(config.imei)
                                  .deviationThreshold
                              }
                              onChange={(e) => {
                                const threshold = e.target.value;
                                updateTrackerUIState(
                                  config.imei,
                                  "deviationThreshold",
                                  threshold
                                );
                                updateAdvancedCriteria(
                                  index,
                                  "routeDeviation",
                                  "threshold",
                                  `${threshold}m`
                                );
                              }}
                              placeholder="Enter distance in meters"
                              disabled={disabled}
                            />

                            <Select
                              label="Select Routes"
                              options={routeOptions}
                              value={
                                getTrackerUIState(config.imei).selectedRoutes
                              }
                              onChange={(value) => {
                                updateTrackerUIState(
                                  config.imei,
                                  "selectedRoutes",
                                  value as string[]
                                );
                                updateAdvancedCriteria(
                                  index,
                                  "routeDeviation",
                                  "routeList",
                                  value as string[]
                                );
                              }}
                              placeholder="Select routes..."
                              multiple
                              disabled={disabled}
                            />
                          </div>
                        </Card>
                      )}
                    </div>
                  )}
                  {/* Alert Toggle */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.alertEnable}
                        onChange={(e) =>
                          updateConfigField(
                            index,
                            "alertEnable",
                            e.target.checked
                          )
                        }
                        disabled={disabled}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Alert
                      </span>
                    </label>
                  </div>
                  {/* Notification Types */}
                  {config.alertPriority !== "none" &&
                    config.alertPriority !== "low" && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Notification Types
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {notificationTypeOptions
                            .filter((notif) => {
                              // Filter out IVR for mid priority
                              if (
                                notif.value === "ivr" &&
                                config.alertPriority === "mid"
                              ) {
                                return false;
                              }
                              return true;
                            })
                            .map((notif) => (
                              <label
                                key={notif.value}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    config.notifications[
                                      notif.value as keyof Notifications
                                    ]
                                  }
                                  onChange={(e) =>
                                    updateNotifications(
                                      index,
                                      notif.value as keyof Notifications,
                                      e.target.checked
                                    )
                                  }
                                  disabled={disabled}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {notif.label}
                                </span>
                              </label>
                            ))}
                        </div>

                        {/* High Priority Additional Options */}
                        {config.alertPriority === "high" && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={config.notifications.ivr}
                                  onChange={(e) =>
                                    updateNotifications(
                                      index,
                                      "ivr",
                                      e.target.checked
                                    )
                                  }
                                  disabled={disabled}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">
                                  IVR
                                </span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={config.notifications.acknowledgement}
                                  onChange={(e) =>
                                    updateNotifications(
                                      index,
                                      "acknowledgement",
                                      e.target.checked
                                    )
                                  }
                                  disabled={disabled}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">
                                  Acknowledgement
                                </span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  {/* Contact Details */}
                  {(config.notifications.whatsapp ||
                    config.notifications.email ||
                    config.notifications.sms ||
                    config.notifications.telegram ||
                    config.notifications.ivr) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Contact Details
                      </h4>
                      <div className="space-y-4">
                        {/* SMS Contacts - ADD THIS */}
                        {config.notifications.sms && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-600">
                                SMS Contacts
                              </label>
                              <button
                                type="button"
                                onClick={() => addContact(index, "smsContacts")}
                                disabled={
                                  disabled ||
                                  config.contactDetails.smsContacts.length >= 3
                                }
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                              >
                                <FiPlus size={16} />
                                <span>Add Contact</span>
                              </button>
                            </div>
                            {config.contactDetails.smsContacts.map(
                              (contact: any, contactIndex: any) => (
                                <div
                                  key={contactIndex}
                                  className="flex space-x-2 mb-2"
                                >
                                  <input
                                    type="text"
                                    placeholder="Name"
                                    value={contact.name}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.smsContacts[
                                        contactIndex
                                      ].name = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="9876543210"
                                    value={contact.number}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.smsContacts[
                                        contactIndex
                                      ].number = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeContact(
                                        index,
                                        "smsContacts",
                                        contactIndex
                                      )
                                    }
                                    disabled={disabled}
                                    className="text-red-600 hover:text-red-700 p-2"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Telegram Contacts - ADD THIS */}
                        {config.notifications.telegram && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-600">
                                Telegram Contacts
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  addContact(index, "telegramContacts")
                                }
                                disabled={
                                  disabled ||
                                  config.contactDetails.telegramContacts
                                    .length >= 3
                                }
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                              >
                                <FiPlus size={16} />
                                <span>Add Contact</span>
                              </button>
                            </div>
                            {config.contactDetails.telegramContacts.map(
                              (contact: any, contactIndex: any) => (
                                <div
                                  key={contactIndex}
                                  className="flex space-x-2 mb-2"
                                >
                                  <input
                                    type="text"
                                    placeholder="Name"
                                    value={contact.name}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.telegramContacts[
                                        contactIndex
                                      ].name = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="@username"
                                    value={contact.username}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.telegramContacts[
                                        contactIndex
                                      ].username = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Chat ID"
                                    value={contact.chatId}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.telegramContacts[
                                        contactIndex
                                      ].chatId = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeContact(
                                        index,
                                        "telegramContacts",
                                        contactIndex
                                      )
                                    }
                                    disabled={disabled}
                                    className="text-red-600 hover:text-red-700 p-2"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* IVR Contacts - ADD THIS */}
                        {config.notifications.ivr && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-600">
                                IVR Contacts
                              </label>
                              <button
                                type="button"
                                onClick={() => addContact(index, "ivrContacts")}
                                disabled={
                                  disabled ||
                                  config.contactDetails.ivrContacts.length >= 3
                                }
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                              >
                                <FiPlus size={16} />
                                <span>Add Contact</span>
                              </button>
                            </div>
                            {config.contactDetails.ivrContacts.map(
                              (contact: any, contactIndex: any) => (
                                <div
                                  key={contactIndex}
                                  className="flex space-x-2 mb-2"
                                >
                                  <input
                                    type="text"
                                    placeholder="Name"
                                    value={contact.name}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.ivrContacts[
                                        contactIndex
                                      ].name = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="9876543210"
                                    value={contact.number}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.ivrContacts[
                                        contactIndex
                                      ].number = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeContact(
                                        index,
                                        "ivrContacts",
                                        contactIndex
                                      )
                                    }
                                    disabled={disabled}
                                    className="text-red-600 hover:text-red-700 p-2"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {config.notifications.whatsapp && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-600">
                                WhatsApp Contacts
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  addContact(index, "whatsappContacts")
                                }
                                disabled={
                                  disabled ||
                                  config.contactDetails.whatsappContacts
                                    .length >= 3
                                }
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                              >
                                <FiPlus size={16} />
                                <span>Add Contact</span>
                              </button>
                            </div>
                            {config?.contactDetails?.whatsappContacts?.map(
                              (contact: any, contactIndex: any) => (
                                <div
                                  key={contactIndex}
                                  className="flex space-x-2 mb-2"
                                >
                                  <input
                                    type="text"
                                    placeholder="Name"
                                    value={contact.name}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.whatsappContacts[
                                        contactIndex
                                      ].name = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="9876543210"
                                    value={contact.number}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.whatsappContacts[
                                        contactIndex
                                      ].number = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeContact(
                                        index,
                                        "whatsappContacts",
                                        contactIndex
                                      )
                                    }
                                    disabled={disabled}
                                    className="text-red-600 hover:text-red-700 p-2"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {config.notifications.email && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-600">
                                Email Contacts
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  addContact(index, "emailContacts")
                                }
                                disabled={
                                  disabled ||
                                  config.contactDetails.emailContacts.length >=
                                    3
                                }
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                              >
                                <FiPlus size={16} />
                                <span>Add Contact</span>
                              </button>
                            </div>
                            {config?.contactDetails?.emailContacts?.map(
                              (contact: any, contactIndex: any) => (
                                <div
                                  key={contactIndex}
                                  className="flex space-x-2 mb-2"
                                >
                                  <input
                                    type="text"
                                    placeholder="Name"
                                    value={contact.name}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.emailContacts[
                                        contactIndex
                                      ].name = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={contact.email}
                                    onChange={(e) => {
                                      const updatedConfigs = [...alertConfigs];
                                      updatedConfigs[
                                        index
                                      ].contactDetails.emailContacts[
                                        contactIndex
                                      ].email = e.target.value;
                                      onConfigsChange(updatedConfigs);
                                    }}
                                    disabled={disabled}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeContact(
                                        index,
                                        "emailContacts",
                                        contactIndex
                                      )
                                    }
                                    disabled={disabled}
                                    className="text-red-600 hover:text-red-700 p-2"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AlertConfigurationTabs;
