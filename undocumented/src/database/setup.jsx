// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpI5dUGoRaQMGDhNa16WV1u4sfs9IgqSk",
  authDomain: "undocumented.firebaseapp.com",
  projectId: "undocumented",
  storageBucket: "undocumented.firebasestorage.app",
  messagingSenderId: "28113247597",
  appId: "1:28113247597:web:918703d99eec85a9de8e64",
  measurementId: "G-ZR2P58L474",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const analytics = getAnalytics(app);

export { database };
