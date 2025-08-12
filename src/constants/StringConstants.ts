// StringConstants.ts - Updated and reorganized
export class StringConstants {
  // Modules
  DEVICE = "DEVICE";
  VEHICLE = "VEHICLE";
  DRIVER = "DRIVER";
  CLIENT = "CLIENT";
  TRANSPORTER = "TRANSPORTER";
  CONTRACTOR = "CONTRACTOR";
  VEHICLE_MASTER = "VEHICLE_MASTER";
  DEVICE_ONBOARDING_MODULE = "DEVICE_ONBOARDING";
  GROUPS_MODULE = "GROUPS"; // Simple groups (Group Modules)
  GROUPS_MASTER_MODULE = "GROUPS_MASTER"; // Complex groups with IMEI (Group Masters)
  ROLES_MODULE = "ROLES";
  ACCOUNTS_MODULE = "ACCOUNTS";
  USERS_MODULE = "USERS";
  ROAD_MASTER_MODULE = "ROAD_MASTER";
  DEVICE_DATA_MODULE = "DEVICE_DATA";
  ALERTS_MODULE = "ALERTS";
  GEOZONES="Geozones";
  ROUTES="Routes"


  // Navigation
  HOME = "Home";
  DEVICES = "Devices";
  VEHICLES = "Vehicles";
  DRIVERS = "Drivers";
  CLIENTS = "Clients";
  TRANSPORTERS = "Transporters";
  CONTRACTORS = "Contractors";
  VEHICLE_MASTERS = "Vehicle Masters";
  DEVICE_ONBOARDING = "Device On-boarding";
  GROUPS = "Groups"; // Simple groups
  GROUPS_MASTER = "Groups Master"; // Complex groups
  ROLES = "Roles";
  ACCOUNTS = "Accounts";
  USERS = "Users";
  ROAD_MASTER = "Road Master";
  DEVICE_DATA = "Device Data";
  ALERTS = "Alerts"; 
  TELECOM_MASTER="Telecom Master"


  // Status
  ACTIVE = "Active";
  INACTIVE = "Inactive";

  // Actions
  ADD = "Add";
  UPDATE = "Update";
  EDIT = "Edit";
  SEARCH = "Search";
  DELETE = "Delete";
  CANCEL = "Cancel";
  SAVE = "Save";
  NEXT = "Next";
  PREVIOUS = "Previous";
  EXPORT = "Export";

  // Device specific
  ADD_DEVICE = "Add Device";
  UPDATE_DEVICE = "Update Device";
  EDIT_DEVICE = "Edit Device";

  // Driver specific
  ADD_DRIVER = "Add Driver";
  UPDATE_DRIVER = "Update Driver";
  EDIT_DRIVER = "Edit Driver";

  // Vehicle Master specific
  ADD_VEHICLE_MASTER = "Add Vehicle Master";
  UPDATE_VEHICLE_MASTER = "Update Vehicle Master";
  EDIT_VEHICLE_MASTER = "Edit Vehicle Master";

  // Device On-boarding specific
  ADD_DEVICE_ONBOARDING = "Add Device On-boarding";
  UPDATE_DEVICE_ONBOARDING = "Update Device On-boarding";
  EDIT_DEVICE_ONBOARDING = "Edit Device On-boarding";


    // Telecome Master specific
  ADD_TELECOM_MASTER = "Add Telecom Master";
  UPDATE_TELECOM_MASTER = "Update Telecom Master";
  EDIT_TELECOM_MASTER = "Edit Telecom Master";

  // Groups specific (Simple groups - Group Modules)
  ADD_GROUP = "Add Group";
  UPDATE_GROUP = "Update Group";
  EDIT_GROUP = "Edit Group";

  // Groups Master specific (Complex groups with IMEI)
  ADD_GROUPS_MASTER = "Add Groups Master";
  UPDATE_GROUPS_MASTER = "Update Groups Master";
  EDIT_GROUPS_MASTER = "Edit Groups Master";


    // Alerts specific - ADD THESE
  ADD_ALERT = "Add Alert";
  UPDATE_ALERT = "Update Alert";
  EDIT_ALERT = "Edit Alert";

  // Users specific
  ADD_USER = "Add User";
  UPDATE_USER = "Update User";
  EDIT_USER = "Edit User";


  // Device Data specific - ADD THESE
  HEX_DATA = "Hex Data";
  TRACK_DATA = "Track Data";
  SELECT_IMEI = "Select IMEI";
  DATE_RANGE = "Date Range";
  FILTER_DATA = "Filter Data";

  // Road Master specific (Read-only module)
  VIEW_ROAD_MASTER = "View Road Master";
  EXPORT_ROAD_MASTER = "Export Road Master";

  // Roles specific
  ADD_ROLE = "Add Role";
  UPDATE_ROLE = "Update Role";
  EDIT_ROLE = "Edit Role";

  // Accounts specific
  ADD_ACCOUNT = "Add Account";
  UPDATE_ACCOUNT = "Update Account";
  EDIT_ACCOUNT = "Edit Account";

  // Client specific
  ADD_CLIENT = "Add Client";
  UPDATE_CLIENT = "Update Client";
  EDIT_CLIENT = "Edit Client";

  // Vehicle specific
  ADD_VEHICLE = "Add Vehicle";
  UPDATE_VEHICLE = "Update Vehicle";
  EDIT_VEHICLE = "Edit Vehicle";

  // Message types
  SUCCESS = "success";
  ERROR = "error";

  // Common form labels
  MODEL_NAME = "Model Name";
  MANUFACTURER_NAME = "Manufacturer Name";
  DEVICE_TYPE = "Device Type";
  IP_ADDRESS = "IP Address";
  PORT = "Port";
  STATUS = "Status";
  STATE_NAME = "State Name";
  CITY_NAME = "City Name";
  REMARK = "Remark";
  CONTACT_NO = "Contact No";

  // Driver form labels
  DRIVER_NAME = "Driver Name";
  DRIVER_CONTACT_NO = "Contact No";
  DRIVER_EMAIL = "Email";
  DRIVER_LICENSE_NO = "License No";
  DRIVER_ADHAR_NO = "Aadhar No";

  // Vehicle Master form labels
  VEHICLE_NUMBER = "Vehicle Number";
  CHASSIS_NUMBER = "Chassis Number";
  ENGINE_NUMBER = "Engine Number";
  VEHICLE_MODEL_NAME = "Vehicle Model";
  DRIVER_SELECTION = "Driver Selection";

  // Device On-boarding form labels
  ACCOUNT_NAME = "Account Name";
  DEVICE_IMEI = "Device IMEI";
  DEVICE_SERIAL_NO = "Device Serial No";
  SIM_NO_1 = "SIM No 1";
  SIM_NO_2 = "SIM No 2";
  SIM_NO_1_OPERATOR = "SIM No 1 Operator";
  SIM_NO_2_OPERATOR = "SIM No 2 Operator";
  VEHICLE_DESCRIPTION = "Vehicle Description";

  // Groups form labels (Simple groups)
  GROUP_NAME = "Group Name";
  GROUP_TYPE = "Group Type";

  // Groups Master form labels (Complex groups with IMEI)
  GROUP_MODULE = "Group Module";
  SELECT_ASSET_IMEI = "Select Asset/IMEI";

  // Users form labels
  SELECT_ACCOUNT_OR_GROUP = "Select Account or Group";
  USERNAME = "Username";
  FIRST_NAME = "First Name";
  MIDDLE_NAME = "Middle Name";
  LAST_NAME = "Last Name";
  EMAIL = "Email";
  PASSWORD = "Password";
  USER_ROLE = "User Role";

  // Roles form labels
  ROLE_NAME = "Role Name";
  DISPLAY_NAME = "Display Name";
  DESCRIPTION = "Description";
  MODULE_PERMISSIONS = "Module Permissions";
  USER_ROLE_TYPE = "User Role Type";

  // Accounts form labels
  PARENT_ACCOUNT = "Parent Account";
  CLIENT_SELECTION = "Client Selection";

  // Client form labels
  CLIENT_NAME = "Client Name";
  CONTACT_NAME = "Contact Name";
  EMAIL_ID = "Email ID";
  PAN_NUMBER = "Pan Number";
  AADHAR_NUMBER = "Aadhar Number";
  GST_NUMBER = "GST Number";

  // Vehicle form labels
  BRAND_NAME = "Brand Name";
  VEHICLE_TYPE = "Vehicle Type";
  ICON = "Icon";


  // Alerts form labels - ADD THESE
  CATEGORY = "Category";
  ALERT_NAME = "Alert Name";
  ALERT_DESCRIPTION = "Alert Description";
  ALERT_PRIORITY = "Alert Priority";
  ALERT_CRITERIA = "Alert Criteria";
  NOTIFICATION_TYPES = "Notification Types";
  CONTACT_DETAILS = "Contact Details";

    // Telecom master form labels 
  CCID_NUMBER = "CCID Number";
  IMSI_NUMBER = "IMSI Number";
  TELECOM_OPERATOR = "Telecom Operator";
  SIM_TYPE = "Sim Type";
  NO_OF_NETWORK = "No. Of Network";
  MOBILE_NO_1 = "Mobile Number 1";
  MOBILE_NO_2 = "Mobile Number 2";
  NETWORK_SUPPORT="Network Support"
  APN_1="Apn 1"
  APN_2="Apn 2"


  // Road Master labels
  DISTRICT_NAME = "District Name";
  SCHEME_TYPE = "Scheme Type";
  PACKAGE_NO = "Package No";
  ROAD_CODE = "Road Code";
  ROAD_NAME = "Road Name";
  PIU_NAME = "PIU Name";
  CONTRACTOR_NAME = "Contractor Name";
  NO_OF_DEVICES = "No. of Devices";
  WORK_STAGE = "Work Stage";
  DEVICE_INSTALLATION_STATUS = "Device Installation Status";
  KML_DATA_STATUS = "KML Data Status";
  SANCTION_DATE = "Sanction Date";
  SANCTION_LENGTH = "Sanction Length";
  ACTIVITY_NAME = "Activity Name";
  ACTIVITY_QUANTITY = "Activity Quantity";
  ACTIVITY = "Activity";
  ACTUAL_ACTIVITY_START_DATE = "Actual Activity Start Date";
  ACTIVITY_COMPLETION_DATE = "Activity Completion Date";
  ACTUAL_ACTIVITY_COMPLETION_DATE = "Actual Activity Completion Date";
  AWARD_DATE = "Award Date";
  COMPLETED_ROAD_LENGTH = "Completed Road Length";
  COMPLETION_DATE = "Completion Date";
  EXECUTED_QUANTITY = "Executed Quantity";
  PIMS_FINALIZE_DATE = "PIMS Finalize Date";

  // Validation messages
  REQUIRED_FIELD = "This field is required";
  INVALID_IP_FORMAT = "Invalid IP Address format";
  INVALID_PORT_RANGE = "Port must be between 1 and 65535";
  INVALID_EMAIL_FORMAT = "Invalid email format";
  INVALID_CONTACT_FORMAT = "Invalid contact number format";
  INVALID_PAN_FORMAT = "Invalid PAN format";
  INVALID_AADHAR_FORMAT = "Invalid Aadhar format";
  INVALID_GST_FORMAT = "Invalid GST format";
  INVALID_LICENSE_FORMAT = "Invalid license format";
  INVALID_IMEI_FORMAT = "IMEI should be 15-17 characters";
  INVALID_PASSWORD_LENGTH = "Password must be at least 6 characters";


  // Modules
  MONITORING = "MONITORING";
  DASHBOARD = "DASHBOARD";
  // DEVICES = "DEVICES";
  // VEHICLES = "VEHICLES";
  // CLIENTS = "CLIENTS";
  GEOFENCES_AND_ROUTES = "GEOFENCES AND ROUTES";
  TRACKPLAY = "TRACKPLAY";
  // DEVICE_ONBOARDING = "DEVICE ONBOARDING";
  // ALERTS = "ALERTS";
  REPORT = "REPORT";
  
  // Navigation
  // HOME = "Home";
  SETTINGS = "Settings";
  PROFILE = "Profile";
  LOGOUT = "Logout";
  
  // Theme
  DARK_MODE = "DARK MODE";
  DAY_MODE = "DAY MODE";
  LIGHT_MODE = "LIGHT MODE";
  
  // Status
  ONLINE = "Online";
  OFFLINE = "Offline";
  MOTION = "Motion";
  HALT = "Halt";
  IDLE = "Idle";
  ALL_DEVICE = "All Device";
  
  // Time
  MINUTES = "minutes";
  SECONDS = "seconds";
  
  // Common
  LOADING = "Loading...";
  // ERROR = "Error";
  // SUCCESS = "Success";
  WARNING = "Warning";
  INFO = "Info";
  // CANCEL = "Cancel";
  // SAVE = "Save";
  // DELETE = "Delete";
  // EDIT = "Edit";
  // ADD = "Add";
  VIEW = "View";
  // EXPORT = "Export";
  IMPORT = "Import";
  // SEARCH = "Search";
  FILTER = "Filter";
  REFRESH = "Refresh";
  
  // Language
  ENGLISH = "English";
  SELECT_LANGUAGE = "Select Language";
  
  // Download App
  DOWNLOAD_APP = "Download app";
  GET_IT_ON_GOOGLE_PLAY = "Get it on Google Play";
  DOWNLOAD_ON_APP_STORE = "Download on the App Store";
  
  // Legal
  TERMS_CONDITIONS = "Terms & Conditions";
  PRIVACY_POLICY = "Privacy Policy";
}

let strings = new StringConstants();
export default strings;