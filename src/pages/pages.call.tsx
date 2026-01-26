import { useRef, useEffect, useState } from "react";
import { createRoom, joinRoom } from "../webrtc";
import { callReject } from "../calling";
import { useCall } from "@/statemng/calling";
import { useNavigate } from "react-router-dom";

export default function Callpage() {
  //export default function Callpage({type}:{type:string}) {
  const navigate = useNavigate();
  const { call } = useCall();

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
    let screenStream: MediaStream;

    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
    } catch (err) {
      console.warn("Screen capture blocked:", err);
      return;
    }

    let micStream: MediaStream | null = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      console.warn("Mic not available");
    }

    const combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...(micStream?.getAudioTracks() ?? [])
    ]);

    setLocalStream(combinedStream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = combinedStream;
    }
  }


  // 🔹 Setup connection once local stream is ready
  useEffect(() => {
    if (!peerConnection || !localStream) return;
    console.log("let's go")
    async function setupConnection() {

      if (!call.status) return;
      const type = call.type === 'incoming' ? 'callee' : 'caller';
      if (type === "caller") {
        if (peerConnection && localStream && remoteStream)
          await createRoom(peerConnection, localStream, remoteStream);
      } else {
        if (peerConnection && localStream && remoteStream)
          await joinRoom(peerConnection, localStream, remoteStream);
      }
    }

    setupConnection();
  }, [peerConnection, localStream, remoteStream]);

  // 🔹 Hang up
  async function hangUp() {
    peerConnection?.close();
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());

    console.log("🔴 Call ended.");

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    await callReject();
    if (window.innerWidth < 768) {
      navigate(-1);
    }

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

