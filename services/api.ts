// services/api.ts – add updateRewards
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getBaseUrl = (): string => {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.hostUri;
    if (hostUri) {
        const host = hostUri.split(':')[0];
        return `http://${host}:5000/api`;
    }
    return 'http://your-server-ip:5000/api';
};

const API_URL = getBaseUrl();

export const storeToken = async (token: string): Promise<void> => {
    await AsyncStorage.setItem('auth_token', token);
};

export const getToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem('auth_token');
};

export const clearToken = async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
};

interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    auth?: boolean;
}

const request = async (path: string, options: RequestOptions): Promise<any> => {
    const { method, body, auth = false } = options;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (auth) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
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

export const signup = (data: any) => request('/auth/signup', { method: 'POST', body: data });
export const login = (data: any) => request('/auth/login', { method: 'POST', body: data });
export const getProfile = () => request('/profile', { method: 'GET', auth: true });
export const updateProfile = (data: any) => request('/profile', { method: 'PUT', body: data, auth: true });
export const getSettings = () => request('/settings', { method: 'GET', auth: true });
export const updateSettings = (data: any) => request('/settings', { method: 'PUT', body: data, auth: true });
export const updateStats = (data: {
    learning?: number;
    games?: number;
    routine?: number;
    behavioral?: number;
}) => request('/profile/stats', { method: 'PUT', body: data, auth: true });

// ─── NEW: update rewards ────────────────────────────────────────
export const updateRewards = (data: {
    stars?: number;
    badges?: number;
    streak?: number;
    achievements?: Array<{ title: string; icon: string; earned: boolean; date: string | null }>;
}) => request('/profile/rewards', { method: 'PUT', body: data, auth: true });