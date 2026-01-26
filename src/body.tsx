import { useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { getRedirectResult, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

import Nav from "@/components/navbar"
import { useStore } from "./statemng/zustand";
import Contacts from "./contact";
import { addUser } from "./db";
import { useError } from "./statemng/error";


export default function Body() {
  const [user, setUser] = useState<any>(null);
  const { setLogin } = useStore();
  const { setError } = useError();

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {


        await user.reload(); // IMPORTANT
        if (!user.emailVerified) {
          setError({ status: true, message: 'Email Not Verified check your email' })
          setUser(null);
          setLogin({ status: false });
          return;
        }

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

    getRedirectResult(auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        if (!result) return;
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        console.log('getRedirectResult', token)
        // The signed-in user info.
        // const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        console.log(error)
      });

    return unsubscribe;
  }, []);

  return <div>
    <Nav
      name={user?.email}
    />
    <Contacts />
    {/* {login.status ? <Contacts /> : <AuthSection />} */}
  </div>
}
