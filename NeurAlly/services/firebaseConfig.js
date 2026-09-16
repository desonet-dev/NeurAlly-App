import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBsKxghZZGy32DBsAHsmRkQ66ZY9cShjnY",
  authDomain: "neurally-a68f4.firebaseapp.com",
  projectId: "neurally-a68f4",
  storageBucket: "neurally-a68f4.firebasestorage.app",
  messagingSenderId: "446072505220",
  appId: "1:446072505220:web:9093894aa531653d6f93d1"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);

export { app, auth, db };
