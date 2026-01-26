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
import { signInWithRedirect } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";


export function logout() {
  return signOut(auth);
}

export async function googleLogin() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider);



}

