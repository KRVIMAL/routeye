// hooks/usePermissions.ts
import { useSelector } from 'react-redux';
import { selectRole } from '../store/slices/authSlice';

// Add this selector to your authSlice.ts
// export const selectModulePermissions = (state: RootState) => 
//   state.auth.user?.role?.modulePermissions || [];

const selectModulePermissions = (state: any) => 
  state.auth.user?.role?.modulePermissions || [];

export const usePermissions = () => {
  const modulePermissions = useSelector(selectModulePermissions);
  const userRole = useSelector(selectRole);

  const hasPermission = (module: string, permission: string): boolean => {
    if (!modulePermissions || modulePermissions.length === 0) return false;
    
    const modulePermission = modulePermissions.find((p: any) => p.module === module);
    return modulePermission?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (module: string, permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(module, permission));
  };

  const hasAllPermissions = (module: string, permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(module, permission));
  };

  // Role-based access control with safety checks
  const hasRoleAccess = (requiredRole: string): boolean => {
    if (!userRole) return false;
    const role = userRole?.toLowerCase();
    const required = requiredRole.toLowerCase();
    
    return role === required || role === requiredRole;
  };

  // Check if user is admin or superadmin with safety
  const isAdmin = (): boolean => {
    if (!userRole) return false;
    const role = userRole?.toLowerCase();
    return role === 'admin';
  };

  const isSuperAdmin = (): boolean => {
    if (!userRole) return false;
    const role = userRole?.toLowerCase();
    return role === 'superadmin' || role === 'super_admin';
  };

  const isAdminOrSuperAdmin = (): boolean => {
    return isAdmin() || isSuperAdmin();
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRoleAccess,
    isAdmin,
    isSuperAdmin,
    isAdminOrSuperAdmin,
    modulePermissions,
    userRole
  };
};