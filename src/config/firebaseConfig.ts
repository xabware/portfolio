import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { isAnalyticsEnabled } from './analyticsConfig';

const requiredFirebaseEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export const missingFirebaseEnvVars = requiredFirebaseEnvVars.filter(
  key => !import.meta.env[key]
);

// Las variables se inyectan en build time via GitHub Actions secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  ...(isAnalyticsEnabled ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID } : {}),
};

if (missingFirebaseEnvVars.length > 0) {
  throw new Error(`[Firebase] Faltan variables de entorno: ${missingFirebaseEnvVars.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
