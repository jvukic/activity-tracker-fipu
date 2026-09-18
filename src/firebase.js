import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSKcFTSuR8N5A7WFXB6huVWzKORVhB6ic",
  authDomain: "activity-tracker-be4d1.firebaseapp.com",
  projectId: "activity-tracker-be4d1",
  storageBucket: "activity-tracker-be4d1.firebasestorage.app",
  messagingSenderId: "853137221007",
  appId: "1:853137221007:web:c52873036c436323afd7fa",
  measurementId: "G-M3W2FZZDZM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, signInWithPopup, signOut, db, collection, addDoc, getDocs, query, where };
