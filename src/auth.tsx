//import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// Sign up
//export async function signUp(email: string, password: string) {
//  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//  console.log("User created:", userCredential.user);
//}
//
//// Login
//export async function login(email: string, password: string) {
//  const userCredential = await signInWithEmailAndPassword(auth, email, password);
//  console.log("User logged in:", userCredential.user);
//}
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";


onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User signed in:", user.email);
  } else {
    console.log("User signed out");
  }
});

export function logout() {
  return signOut(auth);
}


export async function googleLogin() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  console.log("Logged in with Google:", result.user);
}
