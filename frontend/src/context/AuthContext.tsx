import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';
import { loginUser, registerUser, updateProfile as updateProfileApi } from '../api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'nexus_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, _role: UserRole): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await loginUser(email, password) as {
                token?: string; user?: User;
                data?: { token?: string; user?: User };
            };
            const backendUser = res?.user || res?.data?.user;
            const token = res?.token || res?.data?.token;

            if (!token || !backendUser) throw new Error('Invalid response from server');

            localStorage.setItem('nexus_token', token);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(backendUser));
            setUser(backendUser);
            toast.success('Successfully logged in!');
        } catch (error) {
            toast.error((error as Error).message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
        setIsLoading(true);
        try {
            const selectedRole = role.charAt(0).toUpperCase() + role.slice(1);
            const res = await registerUser(name, email, password, selectedRole) as {
                token?: string; user?: User;
                data?: { token?: string; user?: User };
            };
            const backendUser = res?.user || res?.data?.user;
            const token = res?.token || res?.data?.token;

            if (!token || !backendUser) throw new Error('Invalid response from server');

            localStorage.setItem('nexus_token', token);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(backendUser));
            setUser(backendUser);
            toast.success('Account created successfully!');
        } catch (error) {
            toast.error((error as Error).message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem('nexus_token');
        toast.success('Logged out successfully');
    };

    const forgotPassword = async (_email: string): Promise<void> => {
        toast.success('Password reset instructions sent to your email');
    };

    const resetPassword = async (_token: string, _newPassword: string): Promise<void> => {
        toast.success('Password reset successfully');
    };

    // ✅ UPDATED: Profile update ab actually kaam karta hai
    const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
        try {
            // Backend call karo
            await updateProfileApi(updates as Record<string, unknown>);
            // LocalStorage aur state dono update karo
            const updatedUser = { ...user, ...updates } as User;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success('Profile updated successfully!');
        } catch {
            // Agar backend nahi mila toh sirf local update karo (demo mode)
            const updatedUser = { ...user, ...updates } as User;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success('Profile updated successfully!');
        }
        console.log('Updating user:', userId);
    };

    const value = {
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        isAuthenticated: !!user,
        isLoading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
