// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// If using Firestore, also add:
// import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCHTwS4JDqkFhRsHQN2ZfiWRFouBmU8UQ",
  authDomain: "poemaday-50bf3.firebaseapp.com",
  projectId: "poemaday-50bf3",
  storageBucket: "poemaday-50bf3.appspot.com",  // <-- Fix typo here (add .app**spot.com**)
  messagingSenderId: "259003550360",
  appId: "1:259003550360:web:c498cea49864b89d2b1eed",
  measurementId: "G-8M2BRY20B1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Optionally export Firestore if you need it:
// export const db = getFirestore(app);
