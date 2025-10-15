import { 
  doc, 
  updateDoc, 
  onSnapshot,
  arrayUnion,
  setDoc, 
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useCall } from "./statemng/calling";
import { useStore } from "./statemng/zustand";


export async function createRoom(
  peerConnection:any,
  localStream: MediaStream,
  remoteStream: MediaStream
) {
registerPeerConnectionListeners(peerConnection)
  const { login } = useStore.getState();
  const { call } = useCall.getState();
console.log(useCall.getState().call.status);
  if (!login.status || !call.status) return;

  const callerEmail = login.user.email;
  const calleeEmail = call.user.email;

console.log('2')
  // References
  const callRef = doc(db, "calls", call.id);
  const callerIceRef = doc(db, "icecandid", callerEmail);
  const calleeIceRef = doc(db, "icecandid", calleeEmail);

  // Ensure doc exists for caller
  await setDoc(
    callerIceRef,
    { email: callerEmail, candidates: [] },
    { merge: true }
  );

  // 🔹 Add local media tracks
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

console.log('3')
  // 🔹 Handle local ICE candidates
  peerConnection.addEventListener("icecandidate", async event => {
    if (event.candidate) {
      const candidate = event.candidate.toJSON();
      console.log("📤 Sending ICE candidate:", candidate);

      await updateDoc(callerIceRef, {
        candidates: arrayUnion(candidate),
      });
    }
  });

console.log('4')
  // 🔹 Create and send offer
  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription);

  const offer = {
    type: offerDescription.type,
    sdp: offerDescription.sdp,
  };

console.log('5')
  await updateDoc(callRef, { offer });

  // 🔹 Handle remote media tracks
  peerConnection.addEventListener("track", event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  });

  // 🔹 Listen for answer from callee
  onSnapshot(callRef, async snapshot => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(answerDescription);
      console.log("✅ Remote answer applied");
    }
  });

  // 🔹 Listen for new candidates from callee
  onSnapshot(calleeIceRef, async snapshot => {
    const data = snapshot.data();
    if (!data?.candidates) return;

    for (const cand of data.candidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.warn("Failed to add ICE candidate:", err);
      }
    }
  });

  console.log(`📞 Room created between ${callerEmail} → ${calleeEmail}`);
}


export async function joinRoom(
  peerConnection: RTCPeerConnection,
  localStream: MediaStream,
  remoteStream: MediaStream
) {
  console.log(1)
  const { login } = useStore.getState();
  const { call } = useCall.getState();

registerPeerConnectionListeners(peerConnection)
console.log(useCall.getState().call.status);
  if (!login.status || !call.status) return;

  const calleeEmail = login.user.email;
  const callerEmail = call.user.email;

  const callRef = doc(db, "calls", call.id);
  const calleeIceRef = doc(db, "icecandid", calleeEmail);
  const callerIceRef = doc(db, "icecandid", callerEmail);
  // Ensure callee's ICE doc exists
  await setDoc(
    calleeIceRef,
    { email: calleeEmail, candidates: [] },
    { merge: true }
  );

  // 🔹 Add local tracks
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  // 🔹 Handle outgoing ICE candidates
  peerConnection.addEventListener("icecandidate", async event => {
    if (event.candidate) {
      const candidate = event.candidate.toJSON();
      console.log("📤 Sending callee ICE candidate:", candidate);

      await updateDoc(calleeIceRef, {
        candidates: arrayUnion(candidate),
      });
    }
  });

  // 🔹 Handle incoming remote tracks
  peerConnection.addEventListener("track", event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  });

  // 🔹 Wait for the caller's offer and respond with an answer
  let answered = false;
  onSnapshot(callRef, async snapshot => {
    const data = snapshot.data();
    if (!data?.offer || answered) return;

    console.log("📞 Received offer:", data.offer);

    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callRef, { answer });
    answered = true;

    console.log("✅ Sent answer to caller");
  });

  // 🔹 Listen for caller's ICE candidates
  onSnapshot(callerIceRef, async snapshot => {
    const data = snapshot.data();
    if (!data?.candidates) return;

    for (const cand of data.candidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.warn("⚠️ Error adding ICE candidate:", err);
      }
    }
  });

  console.log(`📞 Joined room with caller: ${callerEmail}`);
}

function registerPeerConnectionListeners(peerConnection: RTCPeerConnection) {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(`ICE gathering state: ${peerConnection.iceGatheringState}`);
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener('iceconnectionstatechange', () => {
    console.log(`ICE connection state: ${peerConnection.iceConnectionState}`);
  });
}

