// src/utils/auth.ts

export const isLoggedIn = (): boolean => !!localStorage.getItem('nexus_token');

export const getCurrentUser = () => {
    const user = localStorage.getItem('nexus_user');
    return user ? JSON.parse(user) : null;
};

export const logout = (): void => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    window.location.href = '/login';
};

export const getUserRole = (): string | null => {
    const user = getCurrentUser();
    return user?.role || null;
};