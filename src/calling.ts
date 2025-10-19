import { useStore } from "./statemng/zustand"
import { useCall } from "./statemng/calling";
import { acceptCall, addCall, addContact, rejectCall } from "./db";

export async function initiateCall(email: string) {
  const { login } = useStore.getState();

  if (!login.status) {
    console.error("User not logged in");
    return null;
  }

  try {
    const senderId = login.user.email;
    const receiverId = email;


    await addContact({user:senderId, contact:receiverId});

    const res = await addCall({caller:senderId,callee:receiverId});
    return res.message;

  } catch (err) {
    console.error("Error initiating call or updating contacts:", err);
    return null;
  }
}

export async function callAccept(){
  try{
    const {call} = useCall.getState();
  if(!call.status) return;
  await acceptCall(call.id);
  }
  catch(err){
    console.error(err)
  }
}

export async function callReject(){
  try{
  const { call } = useCall.getState(); // ✅ use getState() since we’re outside React component
  const { login } = useStore.getState(); // ✅ use getState() since we’re outside React component
    if(!call.status||!login.status) return;
  const caller = call.user.email;
    const caller2 = login.user.email;
    console.log(caller, caller2, call.id)
    await rejectCall({caller, callee:caller2, callId:call.id})
    //setCall({status:false});
  }
  catch(err){
    console.error(err)
  }
}

