import { useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import Nav from "@/components/navbar"
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useStore } from "./statemng/zustand";
import AuthSection from "./components/login";
import Contacts from "./contact";


export default function Body() {
  const [user, setUser] = useState<any>(null);
  const {setLogin} = useStore();

async function addUser(name: string | null, email: string | null, photoURL: string | null):Promise<string> {
  try {
    const Collection = collection(db, "users");
    const q = query(Collection, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const docRef = await addDoc(Collection, { name, email, photoURL });
      console.log("User added:", docRef.id);
      return docRef.id; // ✅ return the ID of the newly added user
    } else {
      // If user already exists, return existing document's ID
      const existingId = snapshot.docs[0].id;
      console.log("User already exists:", existingId);
      return existingId;
    }
  } catch (err) {
    console.error(err);
    return '';
  }
}

useEffect(() => {
  return onAuthStateChanged(auth, async (user) => {
    console.log(user?.photoURL);
    if (user) {
      const id = await addUser(user.displayName, user.email, user.photoURL); // ✅ await here
      setUser(user);
      setLogin({
        status: true,
        user: {
          name: user.displayName ?? "",
          email: user.email ?? "",
          photoURL: user.photoURL ?? "",
          id, // actual Firestore document ID now
        },
      });
    } else {
      setUser(null);
      setLogin({ status: false });
    }
  });
}, []);

    return <div>
  <Nav 
  name = {user?.displayName}
  photoURL = {user?.photoURL}
  />
  {user?<Contacts/>:<AuthSection/> }
  </div>
}
