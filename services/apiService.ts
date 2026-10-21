import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.hostUri;
  const host = hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:5000/api`;
};

const AUTH_TOKEN_KEY = 'auth_token';
const OFFLINE_QUEUE_KEY = 'offline_trial_queue';

async function request(path: string, options: RequestInit = {}) {
  const token = await storage.get(AUTH_TOKEN_KEY);
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${getBaseUrl()}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error: any = new Error(data.message || data.error || 'Request failed');
    error.response = { status: response.status, data };
    throw error;
  }
  return data;
}

const post = (path: string, body: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) });
const get = (path: string) => request(path);
const patch = (path: string, body: unknown) => request(path, { method: 'PATCH', body: JSON.stringify(body) });

export async function registerParent(fullName: string, email: string, password: string, confirmPassword: string) {
  const data = await post('/auth/signup', { parentName: fullName, email, password, confirmPassword, childName: 'My Child', childAge: 5 });
  await storage.set(AUTH_TOKEN_KEY, data.token);
  if (data.user) await storage.set('parent_profile', data.user);
  if (data.child) await storage.set('active_child', data.child);
  return data;
}

export async function loginParent(email: string, password: string) {
  const data = await post('/auth/login', { email, password });
  await storage.set(AUTH_TOKEN_KEY, data.token);
  if (data.user) await storage.set('parent_profile', data.user);
  if (data.child) await storage.set('active_child', data.child);
  return data;
}

export async function verifyToken() {
  try {
    if (!(await storage.get(AUTH_TOKEN_KEY))) return null;
    return await post('/auth/verify', {});
  } catch {
    return null;
  }
}

export async function logoutParent() {
  await storage.remove(AUTH_TOKEN_KEY);
  await storage.remove('active_child');
  await storage.remove('parent_profile');
}

async function addToOfflineQueue(trial: unknown) {
  const queue = (await storage.get(OFFLINE_QUEUE_KEY)) || [];
  queue.push({ ...(trial as object), offlineCreated: true, queuedAt: new Date().toISOString() });
  await storage.set(OFFLINE_QUEUE_KEY, queue);
}

export async function syncOfflineQueue() {
  const queue = (await storage.get(OFFLINE_QUEUE_KEY)) || [];
  const remaining = [];
  for (const trial of queue) {
    try { await post('/behaviour/trials', trial); } catch { remaining.push(trial); }
  }
  await storage.set(OFFLINE_QUEUE_KEY, remaining);
}

export async function startSession(childId: string, deviceInfo: unknown) {
  return post('/sessions/start', { childId, deviceInfo });
}

export async function endSession(sessionId: string, childId: string, summary: unknown) {
  return patch(`/sessions/${sessionId}/end`, { childId, ...(summary as object) });
}

export async function submitTrial(trialData: any) {
  try { return await post('/trials', trialData); }
  catch { await addToOfflineQueue(trialData); return { success: true, offline: true }; }
}

export async function getCognitiveState(childId: string) {
  try {
    const data = await get(`/cognitive/${childId}`);
    await storage.set(`cog_state_${childId}`, data);
    return data;
  } catch {
    return storage.get(`cog_state_${childId}`);
  }
}

export const getDashboard = (childId: string) => get(`/dashboard/${childId}`);

export async function createChild(childData: any) {
  return post('/children', childData);
}

export const getParentChildren = (parentId: string) => get(`/children/parent/${parentId}`);

export const getNextBehaviourScenario = (childId: string, difficulty = 1, excludeIds: string[] = []) => {
  const params = new URLSearchParams({ childId, difficulty: String(difficulty) });
  if (excludeIds.length) params.set('excludeIds', excludeIds.join(','));
  return get(`/behaviour/scenarios/next?${params.toString()}`);
};

export const submitBehaviourTrial = (trialData: unknown) => post('/behaviour/trials', trialData);
export const getBehaviourSessionSummary = (sessionId: string) => get(`/behaviour/trials/session/${sessionId}`);
export const getBehaviourDashboard = (childId: string) => get(`/behaviour/dashboard/${childId}`);
export const getBehaviourProgress = async (childId: string) => {
  try { return await get(`/behaviour/dashboard/${childId}/progress`); } catch { return null; }
};
