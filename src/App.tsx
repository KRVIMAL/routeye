import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './styles/global.css'
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./hooks/useTheme";
import Login from "./pages/Login";
import Dashboard from "./pages/Modules/Dashboard/Dashboard";
import StyleGuide from "./pages/StyleGuide";
import ProtectedRoute from "./components/protectedRoute.components";
import Layout from "./components/layout.components";
import SelectDemo from "./pages/SelectDemo";
import InputDemo from "./pages/InputDemo";
import DataTableDemo from "./pages/data-table-demo.pages";
import Devices from "./pages/Modules/Devices/Devices";
import AddDeviceForm from "./pages/Modules/Devices/AddDevice/AddEditDeviceForm";
import Clients from "./pages/Modules/Clients/Clients";
import AddClientForm from "./pages/Modules/Clients/AddClient/AddEditClientForm";
import { Toaster } from "react-hot-toast";
import Vehicles from "./pages/Modules/Vehicles/Vehicles";
import AddEditVehicleForm from "./pages/Modules/Vehicles/AddVehicle/AddEditVehicleForm";
import Drivers from "./pages/Masters/Drivers/Drivers";
import AddEditDriverForm from "./pages/Masters/Drivers/AddDriver/AddEditDriverForm";
import VehicleMasters from "./pages/Masters/VehicleMaster/VehicleMasters";
import AddEditVehicleMasterForm from "./pages/Masters/VehicleMaster/AddVehicleMaster/AddEditVehicleMasterForm";
import DeviceOnboarding from "./pages/Modules/DeviceOnboardings/DeviceOnboarding";
import AddEditDeviceOnboardingForm from "./pages/Modules/DeviceOnboardings/AddDeviceOnboarding/AddEditDeviceOnboardingForm";

// Groups (Simple groups - Group Modules)
import Groups from "./pages/Modules/Groups/Groups";
import AddEditGroupForm from "./pages/Modules/Groups/AddEditGroupForm";

// Groups Master (Complex groups with IMEI)
import GroupsMaster from "./pages/Masters/GroupMaster/GroupsMaster";
import AddEditGroupsMasterForm from "./pages/Masters/GroupMaster/AddGroupsMaster/AddEditGroupsMasterForm";

import Roles from "./pages/Modules/Roles/Roles";
import AddEditRoleForm from "./pages/Modules/Roles/AddRole/AddEditRoleForm";
import Accounts from "./pages/Modules/Accounts/Accounts";
import AddEditAccountForm from "./pages/Modules/Accounts/AddAccount/AddEditAccountForm";
import Users from "./pages/Modules/Users/Users";
import AddEditUserForm from "./pages/Modules/Users/AddUser/AddEditUserForm";
import RoadMaster from "./pages/Masters/RoadMaster/RoadMaster";
import { useTokenExpiry } from "./hooks/useTokenExpiry";
import DeviceData from "./pages/Modules/DeviceData/DeviceData";
import AddEditAlertForm from "./pages/Modules/Alerts/AddAlert/AddEditAlertForm";
import Alerts from "./pages/Modules/Alerts/Alerts";
import TelecomMaster from "./pages/Masters/TelecomMaster/TelecomMaster";
import AddEditTelecomMasterForm from "./pages/Masters/TelecomMaster/AddTelecomMaster/AddEditTelecomMasterForm";
import Geozone from "./pages/Modules/Geozone/Geozone";
import RouteTable from "./pages/Modules/Routes/component/RouteTable";
import GeofenceAndRoute from "./pages/Modules/Routes/geofence-and-route";
import Reports from "./pages/Modules/Reports/Reports";
import ButtonExamples from "./pages/ButtonExamples";

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
    <ThemeProvider>
      <ThemeInitializer>
        <Toaster position="top-center" />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/styleguide" element={<StyleGuide />} />
                        <Route path="/selectDemo" element={<SelectDemo />} />
                        <Route path="/inputDemo" element={<InputDemo />} />
                        <Route path="/table-demo" element={<DataTableDemo />} />

                        <Route path="/button-demo" element={<ButtonExamples />} />

                        {/* Other routes */}
                        <Route
                          path="/settings"
                          element={
                            <div className="card card-body">Settings Page</div>
                          }
                        />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeInitializer>
    </ThemeProvider>
  );
}

export default App;