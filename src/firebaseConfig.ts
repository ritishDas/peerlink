// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8PVDnlsIEslSRE4jOAHzOnkuIsN8cUw0",
  authDomain: "serverless-e359d.firebaseapp.com",
  projectId: "serverless-e359d",
  storageBucket: "serverless-e359d.firebasestorage.app",
  messagingSenderId: "571183407353",
  appId: "1:571183407353:web:184ce028f8e004789a4228",
  measurementId: "G-V1HZVEP0N4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
