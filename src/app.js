const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomId = null;

//function copyToClipboard() {
//navigator.clipboard.writeText(roomId).then(() => {
//      alert("Copied room ID to clipboard");
//    }).catch(err => {
//      console.error("Failed to copy: ", err);
//    });
//}

async function createRoom() {
  const db = firebase.firestore();
  const roomRef = await db.collection('rooms').doc();

  console.log('Create PeerConnection with configuration: ', configuration);
  peerConnection = new RTCPeerConnection(configuration);
  registerPeerConnectionListeners();

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  const callerCandidatesCollection = roomRef.collection('callerCandidates');
  peerConnection.addEventListener('icecandidate', event => {
    if (event.candidate) {
      console.log('Got candidate: ', event.candidate);
      callerCandidatesCollection.add(event.candidate.toJSON());
    }
  });

  peerConnection.addEventListener('track', event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const roomWithOffer = { offer: { type: offer.type, sdp: offer.sdp } };
  await roomRef.set(roomWithOffer);

  roomId = roomRef.id;
  document.querySelector('#currentRoom').innerText =
    `Current room is ${roomRef.id} - You are the caller!`;



  roomRef.onSnapshot(async snapshot => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data && data.answer) {
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    }
  });

  roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async change => {
      if (change.type === 'added') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });
}

async function joinRoom() {
  roomId = document.querySelector('#roomId').value.trim();
  if (!roomId) return alert("Please enter a room ID");

  console.log('Join room: ', roomId);
  document.querySelector('#currentRoom').innerText =
    `Current room is ${roomId} - You are the callee!`;

  await joinRoomById(roomId);
}

async function joinRoomById(roomId) {
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(roomId);
  const roomSnapshot = await roomRef.get();

  if (!roomSnapshot.exists) {
    alert("Room not found!");
    return;
  }

  peerConnection = new RTCPeerConnection(configuration);
  registerPeerConnectionListeners();

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
  peerConnection.addEventListener('icecandidate', event => {
    if (event.candidate) {
      calleeCandidatesCollection.add(event.candidate.toJSON());
    }
  });

  peerConnection.addEventListener('track', event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  });

  const offer = roomSnapshot.data().offer;
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  await roomRef.update({
    answer: { type: answer.type, sdp: answer.sdp },
  });

  roomRef.collection('callerCandidates').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(async change => {
      if (change.type === 'added') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });
}

async function startScreenCapture() {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });

  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const combinedStream = new MediaStream([
    ...screenStream.getVideoTracks(),
    ...micStream.getAudioTracks(),
  ]);

  document.querySelector('#localVideo').srcObject = combinedStream;
  localStream = combinedStream;

  remoteStream = new MediaStream();
  document.querySelector('#remoteVideo').srcObject = remoteStream;

  console.log('Stream started:', combinedStream);
}

async function hangUp() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }
  if (peerConnection) {
    peerConnection.close();
  }

  document.querySelector('#localVideo').srcObject = null;
  document.querySelector('#remoteVideo').srcObject = null;
  document.querySelector('#currentRoom').innerText = '';

  if (roomId) {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(roomId);

    const calleeCandidates = await roomRef.collection('calleeCandidates').get();
    calleeCandidates.forEach(async c => await c.ref.delete());

    const callerCandidates = await roomRef.collection('callerCandidates').get();
    callerCandidates.forEach(async c => await c.ref.delete());

    await roomRef.delete();
  }

  location.reload();
}

function registerPeerConnectionListeners() {
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

