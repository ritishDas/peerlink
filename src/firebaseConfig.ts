// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIkEY,
  authDomain: import.meta.env.VITE_AUTHdOMAIN,
  projectId:  import.meta.env.VITE_PROJECTiD,
  storageBucket: import.meta.env.VITE_STORAGEbUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGsENDERiD,
  appId: import.meta.env.VITE_APPiD,
  measurementId: import.meta.env.VITE_MEASUREMENTiD
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
