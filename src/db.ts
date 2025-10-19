import { addDoc, collection, doc, getDocs, getDoc, query, setDoc, updateDoc, where, arrayUnion,  orderBy, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useError } from "./statemng/error";

function response(status: boolean, message: string, data: any):{status:boolean, message:string, data:any} {
  console.log({ status, message, data })
  return { status, message, data };
}

const callsCollection = collection(db, "calls");

export async function checkUser(email:string) {
const userRef = doc(db, 'users', email);
const {setError} = useError.getState();
  const userSnap = await getDoc(userRef);

if (!userSnap.exists()) {
    setError({status:true, message:'No user found with that email'})
  return response(false, "No user found with that email", null);
}
  return response(true, "found user", userSnap);
}

export async function addUser({ email, name, photoURL }: { email: string; name: string; photoURL: string; }) {

  const res = await checkUser(email)
  if(!res.status) {
  const userDocRef = doc(db, "users", email);
  await setDoc(userDocRef, {
    name,
    photoURL,
    status: 'idle'
  });
  return response(true, 'User Added', userDocRef);
  }
}

export async function addCall({ caller, callee }: { caller: string; callee: string; }) {
const {setError} = useError.getState();
  const callerRef = doc(db, "users", caller);
  const calleeRef = doc(db, "users", callee);

  const callerSnap = await getDoc(callerRef);
  const calleeSnap = await getDoc(calleeRef);

  await updateDoc(callerRef, { status: 'outgoing' });
  await updateDoc(calleeRef, { status: 'incoming' });

  if (!callerSnap.exists() || !calleeSnap.exists()) {
    setError({status:true, message:'One or both users do not exist'})
    return response(false, 'One or both users do not exist', null);
  }

  if (callerSnap.data().status !== 'idle' || calleeSnap.data().status !== 'idle') {
    setError({status:true, message:'Users are busy'})
    return response(false, 'Users are busy', null);
  }

  await updateDoc(callerRef, { status: 'outgoing' });
  await updateDoc(calleeRef, { status: 'incoming' });
  const newCall = await addDoc(callsCollection, {
    caller: callerRef,
    callee: calleeRef,
    status: 'ringing',
    createdAt: new Date(),
  });


  return response(true, 'Call initiated', newCall);
}

export async function checkCall(email:string) {
const {setError} = useError.getState();
  const userRef = doc(db, 'users', email)
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    setError({status:true, message:'User does not exist'})
    return response(false, 'User does not exist', null);
  }

  const userData = userSnap.data();
  let callQuery;

  if (userData.status === 'incoming') {
callQuery = query(
  callsCollection,
  where("callee", "==", userRef),
  where("status", "in", ["ringing", "answered"]) // This is the change
);
    const querySnapshot = await getDocs(callQuery);
    
    if (!querySnapshot.empty) {
      const callData = querySnapshot.docs[0].data();
      const callerRef = callData.caller;
      const callerData = (await getDoc(callerRef)).data()
      if(callerData) {
      return response(true, 'Call found', { type: "incoming", id:querySnapshot.docs[0].id, status:callData.status, data:{email:callerRef.id, ...callerData}});
      }
    }
  }
  else if (userData.status === 'outgoing') {
callQuery = query(
  callsCollection,
  where("caller", "==", userRef),
  where("status", "in", ["ringing", "answered"]) // This is the change
);
    const querySnapshot = await getDocs(callQuery);
    if (!querySnapshot.empty) {
      const callData = querySnapshot.docs[0].data();
      const calleeRef = callData.callee;
      const calleeData = (await getDoc(calleeRef)).data()
      if(calleeData) {
      return response(true, 'Call found', { type: "outgoing", id:querySnapshot.docs[0].id, status:callData.status,  data:{email:calleeRef.id, ...calleeData}});
      }
    }
  }
  
  return response(false, 'no call', null);
}

export async function addContact({user, contact}:{user:string, contact:string}) {
  const senderDocRef = doc(db, 'users', user);
  const receiverDocRef = doc(db,'users', contact );
    await updateDoc(senderDocRef, {
      contacts: arrayUnion(receiverDocRef),
    });
  return response(true, 'contact added', null);
}

export async function fetchContacts(email:string) {
const {setError} = useError.getState();

        const userRef = doc(db, "users", email);
        const userSnap = await getDoc(userRef);

        const userData = userSnap.data();
 console.log(userData) 
  if(!userData) return;
  if(userData.contacts)
  return response(true, 'saved contacts', userData.contacts);
  else{
    setError({status:true, message:'no contacts'})
  return response(false, 'no contacts', null);
    }
}

export async function addFriend({user, friend}:{user:string, friend:string}) {
  console.log(user, friend)
  const senderDocRef = doc(db, 'users', user);
  const friendDocRef = doc(db,'users', friend );
    await updateDoc(senderDocRef, {
      friends: arrayUnion(friendDocRef),
    });
  return response(true, 'friend added', null);
}

export async function fetchFriends(email:string) {

        const userRef = doc(db, "users", email);
        const userSnap = await getDoc(userRef);

        const userData = userSnap.data();
 console.log(userData) 
  if(!userData) return;
  if(userData.friends)
  return response(true, 'saved friends', userData.friends);
  else
  return response(false, 'no friends', null);
}

export async function acceptCall(callId:string) {
  const callRef = doc(db, 'calls', callId);
  const res = await updateDoc(callRef, {status:'answered'})
  return response(true, 'call accepted', res);
}


export async function rejectCall({caller, callee, callId}:{caller:string, callee:string, callId:string}) {
  const callRef = doc(db, 'calls', callId);
  const callSnap = await getDoc(callRef)
  const call = callSnap.data();
  if(!call) return;
  if(call.status === 'answered')
   await updateDoc(callRef, {status:'finished'})
  else
   await updateDoc(callRef, {status:'abort'})

  const callerRef = doc(db, 'users', caller);
  await updateDoc(callerRef, {status:'idle'});
  const calleeRef = doc(db, 'users', callee);
  await updateDoc(calleeRef, {status:'idle'});


  return response(true, 'call rejected', null);
}



export async function fetchRecents(email: string) {
  try {
    console.log('fetchRecents',email)
    const userRef = doc(db, "users", email);

    // 1. Create two separate queries
    const incomingQuery = query(
      callsCollection,
      where("callee", "==", userRef),
      where("status", "==", "finished"),
      orderBy("createdAt", "desc")
    );

    const outgoingQuery = query(
      callsCollection,
      where("caller", "==", userRef),
      where("status", "==", "finished"),
      orderBy("createdAt", "desc")
    );

    // 2. Execute both queries in parallel
    const [incomingSnap, outgoingSnap] = await Promise.all([
      getDocs(incomingQuery),
      getDocs(outgoingQuery),
    ]);

    const allCalls = [...incomingSnap.docs, ...outgoingSnap.docs];

    // 3. Resolve user references and map results
    const resultPromises = allCalls.map(async (entry) => {
      const data = entry.data();
      const isOutgoing = data.caller.path === userRef.path;

      // Get the DocumentReference for the *other* user
      const otherUserRef = isOutgoing ? data.callee : data.caller;
      
      // Fetch the other user's actual data
      const userDoc = await getDoc(otherUserRef);
      const userData = userDoc.exists()
        ? { email: userDoc.id, ...(userDoc.data() || {}) }
        : null;

      return {
        id: entry.id,
        type: isOutgoing ? "outgoing" : "incoming",
        createdAt: data.createdAt, // This will be a Firestore Timestamp
        user: userData, // Return the full user object, not a reference
      };
    });

    let result = await Promise.all(resultPromises);

    // 4. Sort the final merged array by date
    console.log(result);
    result.sort((a, b) => {
      const dateA = a.createdAt as Timestamp;
      const dateB = b.createdAt as Timestamp;
      return dateB.toMillis() - dateA.toMillis();
    });
    return { status: true, message: "Recents fetched", data: result };

  } catch (error) {
    console.error("Error fetching recents:", error);
    return { status: false, message: "An error occurred", data: [] };
  }
}
