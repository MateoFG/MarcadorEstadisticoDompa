/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Validar que las variables de entorno críticas estén presentes
const requiredEnvVars = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verificar que todas las variables críticas estén definidas
const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('❌ Firebase configuration error: Missing environment variables:', missingVars);
    throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

const firebaseConfig = {
    ...requiredEnvVars,
    // measurementId es opcional (solo para Analytics)
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('✅ Firebase initializing with project:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Analytics es opcional - solo se inicializa si measurementId está presente
let analytics: Analytics | null = null;
try {
    if (firebaseConfig.measurementId && typeof window !== 'undefined') {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
    } else {
        console.log('ℹ️ Firebase Analytics skipped (no measurementId or running in SSR)');
    }
} catch (error) {
    console.warn('⚠️ Firebase Analytics initialization failed:', error);
}

export { app, analytics, db, auth };
