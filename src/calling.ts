import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useStore } from "./statemng/zustand"
import { db } from "./firebaseConfig";
import { useCall } from "./statemng/calling";

export async function initiateCall(name:string, email: string, photoURL:string) {
  const { login } = useStore.getState(); // ✅ use getState() since we’re outside React component

  if (!login.status) {
    console.error("User not logged in");
    return null;
  }

  try {
    // find callee by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error("No user found with that email");
      return null;
    }

    const receiverId = snapshot.docs[0].id;
    const senderId = login.user.id;

    if(receiverId === senderId){
      console.error("Can't call yourself");
      return null;
    }
    // add new call document
    const callsRef = collection(db, "calls");
    const docRef = await addDoc(callsRef, {
      accepted: false,
      caller: senderId,
      callee: receiverId,
    });

    console.log("Call initiated:", docRef.id);
    return docRef.id; // ✅ return call ID if needed later
  } catch (err) {
    console.error("Error initiating call:", err);
    return null;
  }
}
export async function callAccept(){
  try{
  const { call } = useCall.getState(); // ✅ use getState() since we’re outside React component
  if(!call.status) return;
  const callRef = doc(db, "calls", call.id);
  await updateDoc(callRef, { accepted: true });
  console.log('call updated');
  }
  catch(err){
    console.error(err)
  }
}

export async function callReject(){
  try{
  const { call } = useCall.getState(); // ✅ use getState() since we’re outside React component
  if(!call.status) return;
  console.log('callreject',call.id);
  const callRef = doc(db, "calls", call.id);
  await deleteDoc(callRef);
  console.log('call deleted');
  }
  catch(err){
    console.error(err)
  }
}

