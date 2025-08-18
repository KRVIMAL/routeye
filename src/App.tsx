// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
// import "./styles/globals.css";
import "./styles/global.css";

// Redux Store
import { store } from "./store/store";

// Theme System
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./hooks/useTheme";

// Auth Context (keep your existing one)
import { AuthProvider } from "./contexts/AuthContext";

// Hooks
import { useTokenExpiry } from "./hooks/useTokenExpiry";
import { usePermissions } from "./hooks/usePermissions";

// Auth Pages
import { LoginPage } from "./pages/Modules/Login/Login";
import { EnterOtpPage } from "./pages/Modules/Login/EnterOtp";
import { ForgotPasswordPage } from "./pages/Modules/Login/ForgotPassword";
import { ResetPasswordPage } from "./pages/Modules/Login/ResetPassword";
import { PasswordChangedPage } from "./pages/Modules/Login/PasswordChanged";
import { ContactSupportPage } from "./pages/Modules/Login/ContactSupport";

// Protected Route Component
import ProtectedRoute from "./components/protectedRoute.components";
import Layout from "./components/layout.components";

// Your existing pages
import Login from "./pages/Login"; // Keep for backward compatibility if needed
import Dashboard from "./pages/Modules/Dashboard/Dashboard";
import StyleGuide from "./pages/StyleGuide";
import SelectDemo from "./pages/SelectDemo";
import InputDemo from "./pages/InputDemo";
import DataTableDemo from "./pages/data-table-demo.pages";
import ButtonExamples from "./pages/ButtonExamples";
import InputExamples from "./pages/InputExamples";
import LogoLoader from "./pages/LogoLoader";

// Loader Components
import { LoaderOverlay } from "./components/common/LoaderOverlay";
import { SelectExamples } from "./components/ui/Select/SelectExamples";
import { AutocompleteExamples } from "./components/ui/Autocomplete/AutocompleteExamples";
import { CustomTabsExamples } from "./components/ui/CustomTabs/CustomTabsExamples";
import { CustomSearchExamples } from "./components/ui/CustomSearch/CustomSearchExamples";
import GeofencePage from "./pages/Modules/GeofenceAndRoute/Geofence/GeofencePage";
import Devices from "./pages/Modules/Devices/Devices";
import AddEditDeviceForm from "./pages/Modules/Devices/AddDevice/AddEditDeviceForm";
import Vehicles from "./pages/Modules/Vehicles/Vehicles";
import AddEditVehicleForm from "./pages/Modules/Vehicles/AddVehicle/AddEditVehicleForm";
import Clients from "./pages/Modules/Clients/Clients";
import AddEditClientForm from "./pages/Modules/Clients/AddClient/AddEditClientForm";
import Groups from "./pages/Modules/Groups/Groups";
import AddEditGroupForm from "./pages/Modules/Groups/AddEditGroupForm";
import Drivers from "./pages/Masters/Drivers/Drivers";
import AddEditDriverForm from "./pages/Masters/Drivers/AddDriver/AddEditDriverForm";
import VehicleMasters from "./pages/Masters/VehicleMaster/VehicleMasters";
import AddEditVehicleMasterForm from "./pages/Masters/VehicleMaster/AddVehicleMaster/AddEditVehicleMasterForm";
import GroupsMaster from "./pages/Masters/GroupMaster/GroupsMaster";
import AddEditGroupsMasterForm from "./pages/Masters/GroupMaster/AddGroupsMaster/AddEditGroupsMasterForm";
import AddEditUserForm from "./pages/Modules/Users/AddUser/AddEditUserForm";
import Users from "./pages/Modules/Users/Users";
import DeviceOnboarding from "./pages/Modules/DeviceOnboardings/DeviceOnboarding";
import AddEditDeviceOnboardingForm from "./pages/Modules/DeviceOnboardings/AddDeviceOnboarding/AddEditDeviceOnboardingForm";
import Accounts from "./pages/Modules/Accounts/Accounts";
import AddEditAccountForm from "./pages/Modules/Accounts/AddAccount/AddEditAccountForm";
import TelecomMaster from "./pages/Masters/TelecomMaster/TelecomMaster";
import ChangePassword from "./pages/Modules/ChangePassword/ChangePassword";
import Roles from "./pages/Modules/Roles/Roles";
import AddEditRoleForm from "./pages/Modules/Roles/AddRole/AddEditRoleForm";
import Telecom from "./pages/Modules/Telecom/Telecom";
import AddEditTelecomForm from "./pages/Modules/Telecom/AddTelecom/AddEditTelecomForm";

// Management Wrapper Component
const ManagementWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAdminOrSuperAdmin } = usePermissions();

  // Only allow admin and superadmin roles to access management
  if (!isAdminOrSuperAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">403</h1>
          <p className="text-text-secondary">
            Access Denied - Admin or Super Admin required
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Role-aware component renderer with permission checking
const RoleBasedComponent = ({
  superAdminComponent,
  adminComponent,
}: {
  superAdminComponent: React.ReactNode;
  adminComponent: React.ReactNode;
}) => {
  const { isSuperAdmin, isAdmin } = usePermissions();

  if (isSuperAdmin()) {
    return <>{superAdminComponent}</>;
  } else if (isAdmin()) {
    return <>{adminComponent}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">403</h1>
        <p className="text-text-secondary">
          Access not available for your role.
        </p>
      </div>
    </div>
  );
};

// Permission-based component wrapper
const PermissionWrapper = ({
  module,
  permission,
  children,
}: {
  module: string;
  permission: string;
  children: React.ReactNode;
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(module, permission)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">403</h1>
          <p className="text-text-secondary">
            You don't have permission to access this resource.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Theme Wrapper Component
const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const { theme, mode } = useTheme();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {children}
    </div>
  );
};

function App() {
  useTokenExpiry();

  return (
    <Provider store={store}>
      <ThemeProvider>
        <ThemeInitializer>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#FFFFFF",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#FFFFFF",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#2463EB",
                  secondary: "#FFFFFF",
                },
              },
            }}
          />
          <LoaderOverlay />

          <Router>
            <AuthProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/enter-otp" element={<EnterOtpPage />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="/auth/password-changed"
                  element={<ChangePassword />}
                />
                <Route
                  path="/auth/contact-support"
                  element={<ContactSupportPage />}
                />
                <Route path="/logo-loader" element={<LogoLoader />} />
                {/* Redirect old login route to new auth system */}
                <Route
                  path="/login"
                  element={<Navigate to="/auth/login" replace />}
                />

                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    // <ProtectedRoute>
                    <Layout>
                      <Routes>
                        {/* Dashboard */}
                        <Route path="/" element={<Dashboard />} />

                        {/* Demo Pages */}
                        <Route path="/inputDemo" element={<InputExamples />} />
                        <Route
                          path="/selectDemo"
                          element={<SelectExamples />}
                        />
                        <Route
                          path="/autocompleteDemo"
                          element={<AutocompleteExamples />}
                        />
                        <Route
                          path="/customtabDemo"
                          element={<CustomTabsExamples />}
                        />
                        <Route
                          path="/customsearchDemo"
                          element={<CustomSearchExamples />}
                        />
                        <Route path="/table-demo" element={<DataTableDemo />} />
                        <Route
                          path="/button-demo"
                          element={<ButtonExamples />}
                        />

                        {/* Regular Module Routes (with permission checking) */}
                        <Route
                          path="/devices"
                          element={
                            <PermissionWrapper
                              module="DEVICE"
                              permission="VIEW"
                            >
                              <Devices />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/devices/add"
                          element={
                            <PermissionWrapper module="DEVICE" permission="ADD">
                              <AddEditDeviceForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/devices/edit/:id"
                          element={
                            <PermissionWrapper
                              module="DEVICE"
                              permission="UPDATE"
                            >
                              <AddEditDeviceForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/clients"
                          element={
                            <PermissionWrapper
                              module="CLIENT"
                              permission="VIEW"
                            >
                              <Clients />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/clients/add"
                          element={
                            <PermissionWrapper module="CLIENT" permission="ADD">
                              <AddEditClientForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/clients/edit/:id"
                          element={
                            <PermissionWrapper
                              module="CLIENT"
                              permission="UPDATE"
                            >
                              <AddEditClientForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/vehicles"
                          element={
                            <PermissionWrapper
                              module="VEHICLE"
                              permission="VIEW"
                            >
                              <Vehicles />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/vehicles/add"
                          element={
                            <PermissionWrapper
                              module="VEHICLE"
                              permission="ADD"
                            >
                              <AddEditVehicleForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/vehicles/edit/:id"
                          element={
                            <PermissionWrapper
                              module="VEHICLE"
                              permission="UPDATE"
                            >
                              <AddEditVehicleForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/groups"
                          element={
                            <PermissionWrapper
                              module="GROUPS"
                              permission="VIEW"
                            >
                              <Groups />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/groups/add"
                          element={
                            <PermissionWrapper module="GROUPS" permission="ADD">
                              <AddEditGroupForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/groups/edit/:id"
                          element={
                            <PermissionWrapper
                              module="GROUPS"
                              permission="UPDATE"
                            >
                              <AddEditGroupForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/drivers"
                          element={
                            <PermissionWrapper
                              module="DRIVER"
                              permission="VIEW"
                            >
                              <Drivers />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/drivers/add"
                          element={
                            <PermissionWrapper module="DRIVER" permission="ADD">
                              <AddEditDriverForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/drivers/edit/:id"
                          element={
                            <PermissionWrapper
                              module="DRIVER"
                              permission="UPDATE"
                            >
                              <AddEditDriverForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/vehicle-masters"
                          element={
                            <PermissionWrapper
                              module="VEHICLE_MASTER"
                              permission="VIEW"
                            >
                              <VehicleMasters />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/vehicle-masters/add"
                          element={
                            <PermissionWrapper
                              module="VEHICLE_MASTER"
                              permission="ADD"
                            >
                              <AddEditVehicleMasterForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/vehicle-masters/edit/:id"
                          element={
                            <PermissionWrapper
                              module="VEHICLE_MASTER"
                              permission="UPDATE"
                            >
                              <AddEditVehicleMasterForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/groups-master"
                          element={
                            <PermissionWrapper
                              module="GROUPS"
                              permission="VIEW"
                            >
                              <GroupsMaster />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/groups-master/add"
                          element={
                            <PermissionWrapper module="GROUPS" permission="ADD">
                              <AddEditGroupsMasterForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/groups-master/edit/:id"
                          element={
                            <PermissionWrapper
                              module="GROUPS"
                              permission="UPDATE"
                            >
                              <AddEditGroupsMasterForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/users"
                          element={
                            <PermissionWrapper module="USER" permission="VIEW">
                              <Users />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/users/add"
                          element={
                            <PermissionWrapper module="USER" permission="ADD">
                              <AddEditUserForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/users/edit/:id"
                          element={
                            <PermissionWrapper
                              module="USER"
                              permission="UPDATE"
                            >
                              <AddEditUserForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/devices-onboarding"
                          element={
                            <PermissionWrapper
                              module="DEVICE_ONBOARDING"
                              permission="VIEW"
                            >
                              <DeviceOnboarding />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/devices-onboarding/add"
                          element={
                            <PermissionWrapper
                              module="DEVICE_ONBOARDING"
                              permission="ADD"
                            >
                              <AddEditDeviceOnboardingForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/devices-onboarding/edit/:id"
                          element={
                            <PermissionWrapper
                              module="DEVICE_ONBOARDING"
                              permission="UPDATE"
                            >
                              <AddEditDeviceOnboardingForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route
                          path="/accounts"
                          element={
                            <PermissionWrapper
                              module="ACCOUNT"
                              permission="VIEW"
                            >
                              <Accounts />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/accounts/add"
                          element={
                            <PermissionWrapper
                              module="ACCOUNT"
                              permission="ADD"
                            >
                              <AddEditAccountForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/accounts/edit/:id"
                          element={
                            <PermissionWrapper
                              module="ACCOUNT"
                              permission="UPDATE"
                            >
                              <AddEditAccountForm />
                            </PermissionWrapper>
                          }
                        />

                        {/* Telecom Routes */}
                        <Route
                          path="/telecom"
                          element={
                            <PermissionWrapper
                              module="TELECOM"
                              permission="VIEW"
                            >
                              <Telecom />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/telecom/add"
                          element={
                            <PermissionWrapper
                              module="TELECOM"
                              permission="ADD"
                            >
                              <AddEditTelecomForm />
                            </PermissionWrapper>
                          }
                        />
                        <Route
                          path="/telecom/edit/:id"
                          element={
                            <PermissionWrapper
                              module="TELECOM"
                              permission="UPDATE"
                            >
                              <AddEditTelecomForm />
                            </PermissionWrapper>
                          }
                        />

                        <Route path="/geofences" element={<GeofencePage />} />

                        {/* Management Routes - Role-based content, generic URLs */}
                        <Route
                          path="/management/overview"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={
                                  <Navigate to="/management/devices" replace />
                                }
                                adminComponent={
                                  <Navigate to="/management/drivers" replace />
                                }
                              />
                            </ManagementWrapper>
                          }
                        />

                        {/* Super Admin Management Routes */}
                        <Route
                          path="/management/devices"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={<Devices />}
                                adminComponent={
                                  <div className="card card-body">
                                    Access Denied - Super Admin Only
                                  </div>
                                }
                              />
                            </ManagementWrapper>
                          }
                        />

                        <Route
                          path="/management/vehicles"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={<Vehicles />}
                                adminComponent={
                                  <div className="card card-body">
                                    Access Denied - Super Admin Only
                                  </div>
                                }
                              />
                            </ManagementWrapper>
                          }
                        />

                        <Route
                          path="/management/clients"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={<Clients />}
                                adminComponent={
                                  <div className="card card-body">
                                    Access Denied - Super Admin Only
                                  </div>
                                }
                              />
                            </ManagementWrapper>
                          }
                        />

                        <Route
                          path="/management/groups"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={<Groups />}
                                adminComponent={
                                  <div className="card card-body">
                                    Access Denied - Super Admin Only
                                  </div>
                                }
                              />
                            </ManagementWrapper>
                          }
                        />

                        {/* <Route
                          path="/management/telecom"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={<TelecomMaster />}
                                adminComponent={
                                  <div className="card card-body">
                                    Access Denied - Super Admin Only
                                  </div>
                                }
                              />
                            </ManagementWrapper>
                          }
                        /> */}

                        <Route
                          path="/management/telecom"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={<Telecom />}
                                adminComponent={
                                  <div className="card card-body">
                                    Access Denied - Super Admin Only
                                  </div>
                                }
                              />
                            </ManagementWrapper>
                          }
                        />
                        <Route
                          path="/management/telecom/add"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={<AddEditTelecomForm />}
                                adminComponent={
                                  <div className="card card-body">
                                    Access Denied - Super Admin Only
                                  </div>
                                }
                              />
                            </ManagementWrapper>
                          }
                        />
                        <Route
                          path="/management/telecom/edit/:id"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={<AddEditTelecomForm />}
                                adminComponent={
                                  <div className="card card-body">
                                    Access Denied - Super Admin Only
                                  </div>
                                }
                              />
                            </ManagementWrapper>
                          }
                        />

                        {/* Admin Management Routes */}
                        <Route
                          path="/management/drivers"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={
                                  <div className="card card-body">
                                    Access Denied - Admin Only
                                  </div>
                                }
                                adminComponent={<Drivers />}
                              />
                            </ManagementWrapper>
                          }
                        />

                        <Route
                          path="/management/vehicle-master"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={
                                  <div className="card card-body">
                                    Access Denied - Admin Only
                                  </div>
                                }
                                adminComponent={<VehicleMasters />}
                              />
                            </ManagementWrapper>
                          }
                        />

                        <Route
                          path="/management/group-master"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={
                                  <div className="card card-body">
                                    Access Denied - Admin Only
                                  </div>
                                }
                                adminComponent={<GroupsMaster />}
                              />
                            </ManagementWrapper>
                          }
                        />

                        <Route
                          path="/management/users"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={
                                  <div className="card card-body">
                                    Access Denied - Admin Only
                                  </div>
                                }
                                adminComponent={<Users />}
                              />
                            </ManagementWrapper>
                          }
                        />

                        <Route
                          path="/management/device-onboarding"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={
                                  <div className="card card-body">
                                    Access Denied - Admin Only
                                  </div>
                                }
                                adminComponent={<DeviceOnboarding />}
                              />
                            </ManagementWrapper>
                          }
                        />

                        <Route
                          path="/management/telecom-master"
                          element={
                            <ManagementWrapper>
                              <RoleBasedComponent
                                superAdminComponent={
                                  <div className="card card-body">
                                    Access Denied - Admin Only
                                  </div>
                                }
                                adminComponent={<TelecomMaster />}
                              />
                            </ManagementWrapper>
                          }
                        />

                        {/* Account Management Routes */}
                        <Route
                          path="/account-management/accounts"
                          element={<Accounts />}
                        />
                        <Route
                          path="/account-management/roles"
                          element={<Roles />}
                        />

                        <Route
                          path="/roles/add"
                          element={<AddEditRoleForm />}
                        />
                        <Route
                          path="/roles/edit/:id"
                          element={<AddEditRoleForm />}
                        />

                        <Route
                          path="/account-management/change-password"
                          element={<ChangePassword />}
                        />

                        <Route
                          path="/account-management/appearance-setting"
                          element={
                            <div className="card card-body">
                              <h2 className="text-xl font-bold mb-4">
                                Appearance Settings
                              </h2>
                              <p>Customize your application appearance here.</p>
                            </div>
                          }
                        />

                        {/* Settings */}
                        <Route
                          path="/settings"
                          element={
                            <div className="card card-body">Settings Page</div>
                          }
                        />

                        {/* Catch-all route for 404 */}
                        <Route
                          path="*"
                          element={
                            <div className="flex items-center justify-center min-h-[400px]">
                              <div className="text-center">
                                <h1 className="text-4xl font-bold text-text-primary mb-4">
                                  404
                                </h1>
                                <p className="text-text-secondary">
                                  Page not found
                                </p>
                              </div>
                            </div>
                          }
                        />
                      </Routes>
                    </Layout>
                    // </ProtectedRoute>
                  }
                />
              </Routes>
            </AuthProvider>
          </Router>
        </ThemeInitializer>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
