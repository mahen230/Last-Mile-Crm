import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Enable persistence to handle offline scenarios better
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one
    console.warn('Persistence failed: Multiple tabs open.');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support persistence
    console.warn('Persistence not supported by this browser.');
  }
});

export const auth = getAuth();

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.send',
];

export const googleProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => googleProvider.addScope(scope));

// Workspace provider with Drive, Sheets & Gmail scopes for Centralized Backup & MasterSourceSync
export const googleWorkspaceProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => googleWorkspaceProvider.addScope(scope));

