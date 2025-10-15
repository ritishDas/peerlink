import { useRef, useEffect, useState } from "react";
import { createRoom, joinRoom } from "../webrtc";
import { useNavigate, useParams } from "react-router-dom";
import { useCall } from "../statemng/calling";
import { callReject } from "../calling";

export default function Callpage() {
//export default function Callpage({type}:{type:string}) {
const {setCall} = useCall();
const navigate = useNavigate();
  const {type} = useParams();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream] = useState<MediaStream>(new MediaStream());
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);


  // 🔹 Initialize PeerConnection once
  useEffect(() => {
    const configuration = {
      iceServers: [
        {
          urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
      ],
      iceCandidatePoolSize: 10,
    };
    const pc = new RTCPeerConnection(configuration);
    setPeerConnection(pc);

    // attach remote stream to video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    return () => {
      pc.close();
    };
  }, [remoteStream]);

  // 🔹 Screen capture + audio
async function startScreenCapture() {
  let screenStream: MediaStream | null = null;
  let micStream: MediaStream | null = null;

  // Try to get screen capture, fallback gracefully if not supported
  try {
    if (navigator.mediaDevices.getDisplayMedia) {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // usually screen audio isn't supported on mobile
      });
    } else {
      console.warn("Screen capture not supported on this device/browser.");
    }
  } catch (err) {
    console.warn("Error accessing screen capture:", err);
  }

  // Try to get microphone audio
  try {
    if (navigator.mediaDevices.getUserMedia) {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  } catch (err) {
    console.warn("Error accessing microphone:", err);
  }

  // Combine streams if possible
  let combinedStream: MediaStream;
  if (screenStream && micStream) {
    combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...micStream.getAudioTracks(),
    ]);
  } else if (screenStream) {
    combinedStream = screenStream;
  } else if (micStream) {
    combinedStream = micStream;
  } else {
    console.error("No media available for streaming.");
    return;
  }

  setLocalStream(combinedStream);

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = combinedStream;
  }

  console.log("Stream started:", combinedStream);
}

  // 🔹 Setup connection once local stream is ready
  useEffect(() => {
    if (!peerConnection || !localStream) return;
console.log("let's go")
    async function setupConnection() {
      if (type === "caller") {
        if(peerConnection&&localStream&&remoteStream)
        await createRoom(peerConnection, localStream, remoteStream);
      } else {
        if(peerConnection&&localStream&&remoteStream)
        await joinRoom(peerConnection, localStream, remoteStream);
      }
    }

    setupConnection();
  }, [peerConnection, localStream, remoteStream, type]);

  // 🔹 Hang up
  async function hangUp() {
    peerConnection?.close();
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
    await callReject();
    setCall({status:false});
    navigate('/');

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    console.log("🔴 Call ended.");
  }

  return (
    <div className="text-center">
      <video
        ref={localVideoRef}
        muted
        autoPlay
        playsInline
        className="bg-black block w-[20%] m-10 rounded-md"
      ></video>

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="bg-black block m-auto w-[80%] rounded-md"
      ></video>

      <button
        onClick={hangUp}
        className="mx-auto my-5 bg-red-500 text-white p-3 rounded-md block hover:bg-red-600"
      >
        Hang Up
      </button>

      <button
        onClick={startScreenCapture}
        className="mx-auto my-5 bg-green-500 text-white p-3 rounded-md block hover:bg-green-600"
      >
        Start Screen Share
      </button>
    </div>
  );
}

