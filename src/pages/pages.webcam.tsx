import  { useEffect, useRef, useState } from "react";

export default function LiveStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);

  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  // combine all current streams into a single composite stream
  async function updateStream() {
    // stop old tracks
    [...(screenStream?.getTracks() || []),
     ...(webcamStream?.getTracks() || []),
     ...(micStream?.getTracks() || [])].forEach((t) => t.stop());

    let newScreen: MediaStream | null = null;
    let newWebcam: MediaStream | null = null;
    let newMic: MediaStream | null = null;

    try {
      if (screenEnabled)
        newScreen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (webcamEnabled)
        newWebcam = await navigator.mediaDevices.getUserMedia({ video: true });
      if (audioEnabled)
        newMic = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error(e);
    }

    setScreenStream(newScreen);
    setWebcamStream(newWebcam);
    setMicStream(newMic);

    // Combine tracks for unified audio output (video is visual only)
    const combined = new MediaStream([
      ...(newScreen?.getVideoTracks() || []),
      ...(newWebcam?.getVideoTracks() || []),
      ...(newMic?.getAudioTracks() || []),
    ]);

    if (videoRef.current) videoRef.current.srcObject = combined;
    if (webcamVideoRef.current && newWebcam)
      webcamVideoRef.current.srcObject = newWebcam;
  }

  useEffect(() => {
    updateStream();
    return () => {
      [screenStream, webcamStream, micStream].forEach((s) =>
        s?.getTracks().forEach((t) => t.stop())
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled, screenEnabled, webcamEnabled]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 space-y-4">
      <h1 className="text-2xl font-semibold">🎥 Live Stream Preview</h1>

      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-gray-700">
        {/* Main Screen / Combined video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!audioEnabled}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Webcam Picture-in-Picture overlay */}
        {webcamEnabled && (
          <video
            ref={webcamVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-1/4 rounded-xl border-2 border-white shadow-lg"
          />
        )}
      </div>

      <div className="flex gap-6 mt-4 text-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={(e) => setAudioEnabled(e.target.checked)}
          />
          🎙️ Audio
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={screenEnabled}
            onChange={(e) => setScreenEnabled(e.target.checked)}
          />
          🖥️ Screen
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={webcamEnabled}
            onChange={(e) => setWebcamEnabled(e.target.checked)}
          />
          📷 Webcam
        </label>
      </div>
    </div>
  );
}

