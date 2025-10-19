import { useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import Nav from "@/components/navbar"
import { useStore } from "./statemng/zustand";
import AuthSection from "./components/login";
import Contacts from "./contact";
import { addUser } from "./db";


export default function Body() {
  const [user, setUser] = useState<any>(null);
  const {login, setLogin} = useStore();

useEffect(() => {
  return onAuthStateChanged(auth, async (user) => {
    console.log(user?.photoURL);
    if (user) {
await addUser({
  name: user.displayName ?? "Anonymous",
  email: user.email ?? "no-email@example.com",
  photoURL: user.photoURL ?? "",
});
      setUser(user);
      setLogin({
        status: true,
        user: {
          name: user.displayName ?? "",
          email: user.email ?? "",
          photoURL: user.photoURL ?? "",
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
  {login.status?<Contacts/>:<AuthSection/> }
  </div>
}
