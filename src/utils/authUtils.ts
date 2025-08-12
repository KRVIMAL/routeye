export const mapLoginResponseToAuthState = (apiResponse: any) => {
    const { data } = apiResponse;
    
    if (!data || !data.user) {
        throw new Error('Invalid API response structure');
    }
    
    return {
        authenticated: true,
        accessToken: data.accessToken,
        tokenType: data.tokenType || "Bearer",
        userName: data.user.fullName || `${data.user.firstName} ${data.user.lastName}`.trim(),
        userRole: data.user.role?.name || "",
        userType: data.user.role?.name || "",
        userEmail: data.user.email,
        userAccount: data.user.account?.accountName || "",
        userId: data.user.id,
        expiresIn: data.expiresIn,
        user: data.user,
    };
};