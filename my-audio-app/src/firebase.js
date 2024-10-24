// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZ9Jxt9tat_r7NHUC0pHT7SPU9gaIX1b0",
  authDomain: "loststories-e3b34.firebaseapp.com",
  projectId: "loststories-e3b34",
  storageBucket: "loststories-e3b34.appspot.com",
  messagingSenderId: "165825428166",
  appId: "1:165825428166:web:a4b864f31a544b76b5b5c7",
  measurementId: "G-MGF0CJWY09"
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

let auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.error("Error initializing Firebase Auth:", error);
}

let db;
try {
  db = getFirestore(app);
} catch (error) {
  console.error("Error initializing Firestore:", error);
}

export { auth, db };