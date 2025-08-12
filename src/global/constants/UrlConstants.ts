export class UrlConstants {
  baseURL = import.meta.env.VITE_API_BASE_URL_LOCAL;
  landingViewPath = "/";

  // Device URLs
  devicesViewPath = "/devices";
  devicesFilterPath= "/devices/filter";
  addDeviceViewPath = `${this.devicesViewPath}/add`;
  editDeviceViewPath = `${this.devicesViewPath}/edit`;
  // Client URLs
  clientsViewPath = "/clients";
  addClientViewPath = `${this.clientsViewPath}/add`;
  editClientViewPath = `${this.clientsViewPath}/edit`;

  // Driver URLs
  driversViewPath = "/drivers";
  addDriverViewPath = `${this.driversViewPath}/add`;
  editDriverViewPath = `${this.driversViewPath}/edit`;

  // Vehicle URLs
  vehiclesViewPath = "/vehicles";
  addVehicleViewPath = `${this.vehiclesViewPath}/add`;
  editVehicleViewPath = `${this.vehiclesViewPath}/edit`;

  // Vehicle Master URLs
  vehicleMastersViewPath = "/vehicle-masters";
  addVehicleMasterViewPath = `${this.vehicleMastersViewPath}/add`;
  editVehicleMasterViewPath = `${this.vehicleMastersViewPath}/edit`;

  // Device On-boarding URLs
  deviceOnboardingViewPath = "/devices-onboarding";
  addDeviceOnboardingViewPath = `${this.deviceOnboardingViewPath}/add`;
  editDeviceOnboardingViewPath = `${this.deviceOnboardingViewPath}/edit`;

  // Groups URLs (Simple groups - Group Modules)
  // Frontend route: /groups
  // API endpoint: /group-master
  groupsViewPath = "/groups";
  addGroupViewPath = `${this.groupsViewPath}/add`;
  editGroupViewPath = `${this.groupsViewPath}/edit`;

  // Groups Master URLs (Complex groups with IMEI)
  // Frontend route: /groups-master
  // API endpoint: /groups
  groupsMasterViewPath = "/groups-master";
  addGroupsMasterViewPath = `${this.groupsMasterViewPath}/add`;
  editGroupsMasterViewPath = `${this.groupsMasterViewPath}/edit`;

  // API endpoint mappings (CORRECTED - for backend calls)
  groupModuleViewPath = "/group-master"; // API endpoint for simple groups (Group Modules)
  groupMasterViewPath = "/groups"; // API endpoint for complex groups (Groups Master)

  // Users URLs
  usersViewPath = "/users";
  addUserViewPath = `${this.usersViewPath}/add`;
  editUserViewPath = `${this.usersViewPath}/edit`;

  // Road Master URLs
  roadMasterViewPath = "/omms/data/state-db";
  roadMasterExportPath = "/omms/export";
  // Roles URLs
  rolesViewPath = "/roles";
  addRoleViewPath = `${this.rolesViewPath}/add`;
  editRoleViewPath = `${this.rolesViewPath}/edit`;

  // Accounts URLs
  accountsViewPath = "/accounts";
  addAccountViewPath = `${this.accountsViewPath}/add`;
  editAccountViewPath = `${this.accountsViewPath}/edit`;

  //device data
  deviceDataViewPath = "/devicedata";
  hexDataViewPath = "/hex-data";
  trackDataViewPath = "/track-data";

  // Alerts URLs
  alertsViewPath = "/alerts";
  addAlertViewPath = `${this.alertsViewPath}/add`;
  editAlertViewPath = `${this.alertsViewPath}/edit`;

  // Telecom URLs
  telecomMasterViewPath = "/telecom-master";
  addTelecomMasterViewPath = `${this.telecomMasterViewPath}/add`;
  editTelecomMasterViewPath = `${this.telecomMasterViewPath}/edit`;

  //Geofences URLs
  geofencesViewPath = "/geofences";

  //Routes URLs
  routesViewPath = "/routes";


  // Monitoring URLs 
  monitoringDevicesPath = "/monitoring/devices";

   // Settings Routes
  settingsViewPath = "/settings";
  profileViewPath = "/profile";
  
  // API Routes
  deviceApiPath = "/api/v1/devices";
  vehicleApiPath = "/api/v1/vehicles";
  clientApiPath = "/api/v1/clients";
  driverApiPath = "/api/v1/drivers";
  userApiPath = "/api/v1/users";
  roleApiPath = "/api/v1/roles";
  accountApiPath = "/api/v1/accounts";
  alertApiPath = "/api/v1/alerts";
  reportApiPath = "/api/v1/reports";
}

let urls = new UrlConstants();
export default urls;
