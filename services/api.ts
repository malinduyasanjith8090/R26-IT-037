// services/api.ts – Backend API integration for Bloom
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ─── API base URL detection ─────────────────────────────────────
const getBaseUrl = (): string => {
    // Use Expo's hostUri to get the dev machine's IP when running in development
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.hostUri;
    if (hostUri) {
        const host = hostUri.split(':')[0];
        return `http://${host}:5000/api`;
    }
    // Fallback for production or if hostUri is unavailable
    return 'http://your-server-ip:5000/api';
};

const API_URL = getBaseUrl();

// ─── Token management ────────────────────────────────────────────
export const storeToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
        console.error('Error storing token', error);
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('auth_token');
    } catch (error) {
        console.error('Error getting token', error);
        return null;
    }
};

export const clearToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem('auth_token');
    } catch (error) {
        console.error('Error clearing token', error);
    }
};

// ─── Generic HTTP request helper ─────────────────────────────────
interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    auth?: boolean;
}

const request = async (path: string, options: RequestOptions): Promise<any> => {
    const { method, body, auth = false } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (auth) {
        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(`${API_URL}${path}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// ─── Auth endpoints ─────────────────────────────────────────────
export const signup = (data: {
    parentName: string;
    email: string;
    password: string;
    childName: string;
    childAge: number;
    phone?: string;
    childGender?: string;
}): Promise<any> => {
    return request('/auth/signup', { method: 'POST', body: data });
};

export const login = (data: {
    email: string;
    password: string;
}): Promise<any> => {
    return request('/auth/login', { method: 'POST', body: data });
};

// ─── Profile endpoints ──────────────────────────────────────────
export const getProfile = (): Promise<any> => {
    return request('/profile', { method: 'GET', auth: true });
};

export const updateProfile = (data: {
    parentName?: string;
    email?: string;
    phone?: string;
    childName?: string;
    childAge?: number;
    childGender?: string;
}): Promise<any> => {
    return request('/profile', { method: 'PUT', body: data, auth: true });
};

// ─── Settings endpoints ─────────────────────────────────────────
export const getSettings = (): Promise<any> => {
    return request('/settings', { method: 'GET', auth: true });
};

export const updateSettings = (data: {
    language?: string;
    theme?: string;
    notifications?: {
        push?: boolean;
        email?: boolean;
        sound?: boolean;
        vibration?: boolean;
    };
}): Promise<any> => {
    return request('/settings', { method: 'PUT', body: data, auth: true });
};