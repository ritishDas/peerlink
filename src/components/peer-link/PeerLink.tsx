"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Share, PhoneOff, Clipboard, Check } from 'lucide-react';
import { QualityOptimizer } from './QualityOptimizer';
import { useToast } from "@/hooks/use-toast"

type AppState = 'idle' | 'creating' | 'joining' | 'connected' | 'connecting';

// Stun server configuration
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function PeerLink() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [mySessionInfo, setMySessionInfo] = useState('');
  const [peerSessionInfo, setPeerSessionInfo] = useState('');
  const [isPeerInfoPasted, setIsPeerInfoPasted] = useState(false);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Copied to clipboard!</span>
          </div>
        ),
      })
    }).catch(() => {
       toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy text to clipboard.",
      })
    });
  };

  const setupPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(iceServers);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // The candidate is added to the description sent to the peer
      }
    };
    
    // This is a trick to gather all candidates before creating the offer.
    const candidates: RTCIceCandidate[] = [];
    peerConnection.onicecandidate = e => {
        if (e.candidate) {
            candidates.push(e.candidate);
        }
    };

    // Replace the onicecandidate handler to one that does nothing,
    // so we can gather candidates manually.
    const originalCreateOffer = peerConnection.createOffer;
    peerConnection.createOffer = async (options: RTCOfferOptions) => {
        const offer = await originalCreateOffer.call(peerConnection, options);
        await new Promise<void>(resolve => {
            if (peerConnection.iceGatheringState === 'complete') {
                resolve();
            } else {
                const checkState = () => {
                    if (peerConnection.iceGatheringState === 'complete') {
                        peerConnection.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                peerConnection.addEventListener('icegatheringstatechange', checkState);
            }
        });

        const offerWithCandidates = {
            ...offer.toJSON(),
            candidates: candidates.map(c => c.toJSON())
        };
        
        const finalOffer = { ...offer, sdp: offer.sdp };
        setMySessionInfo(JSON.stringify(offerWithCandidates, null, 2));

        return finalOffer;
    };
    
    const originalCreateAnswer = peerConnection.createAnswer;
    peerConnection.createAnswer = async (options?: RTCOfferOptions) => {
        const answer = await originalCreateAnswer.call(pc.current!, options);
        await new Promise<void>(resolve => {
            if (pc.current?.iceGatheringState === 'complete') {
                resolve();
            } else {
                const checkState = () => {
                    if (pc.current?.iceGatheringState === 'complete') {
                        pc.current.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.current?.addEventListener('icegatheringstatechange', checkState);
            }
        });
        const answerWithCandidates = {
            ...answer.toJSON(),
            candidates: candidates.map(c => c.toJSON())
        };
        setMySessionInfo(JSON.stringify(answerWithCandidates, null, 2));
        return answer;
    };


    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.current = peerConnection;
  }, []);

  const createSession = useCallback(async () => {
    try {
      setAppState('connecting');
      setupPeerConnection();
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => {
        pc.current?.addTrack(track, stream);
      });
      setLocalStream(stream);

      const offer = await pc.current?.createOffer();
      await pc.current?.setLocalDescription(offer);
      
      setAppState('creating');
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        variant: "destructive",
        title: "Failed to start session",
        description: "Please ensure you grant screen sharing permissions.",
      })
      hangUp();
    }
  }, [setupPeerConnection]);

  const joinSession = useCallback(async () => {
    if (!peerSessionInfo) {
      toast({ variant: "destructive", title: "Error", description: "Peer session info is empty."})
      return;
    };

    try {
      setAppState('connecting');
      setupPeerConnection();
      const parsedInfo = JSON.parse(peerSessionInfo);
      const offer = parsedInfo;
      
      await pc.current?.setRemoteDescription(new RTCSessionDescription(offer));

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
       stream.getTracks().forEach((track) => {
        pc.current?.addTrack(track, stream);
      });
      setLocalStream(stream);

      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);

      if (offer.candidates) {
        for (const candidate of offer.candidates) {
          await pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
      setAppState('creating'); // Reuse the same state as creator's step 2
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        variant: "destructive",
        title: "Failed to join session",
        description: "Invalid session info or connection error.",
      })
      hangUp();
    }
  }, [peerSessionInfo, setupPeerConnection]);

  const connectToPeer = useCallback(async () => {
    if (!peerSessionInfo) {
      toast({ variant: "destructive", title: "Error", description: "Peer session info is empty."})
      return
    };

    try {
      const parsedInfo = JSON.parse(peerSessionInfo);
      const answer = parsedInfo;
      if (pc.current?.signalingState !== 'have-local-offer') {
          return; // Can only set answer in this state
      }
      await pc.current?.setRemoteDescription(new RTCSessionDescription(answer));

      if (answer.candidates) {
        for (const candidate of answer.candidates) {
          await pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }

    } catch (error) {
      console.error('Error connecting to peer:', error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Invalid peer info. Please try again.",
      })
    }
  }, [peerSessionInfo]);

  const hangUp = useCallback(() => {
    pc.current?.close();
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    pc.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setMySessionInfo('');
    setPeerSessionInfo('');
    setIsPeerInfoPasted(false);
    setAppState('idle');
  }, [localStream, remoteStream]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      setAppState('connected');
    }
  }, [remoteStream]);
  
  const handlePeerInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPeerSessionInfo(e.target.value);
    setIsPeerInfoPasted(e.target.value.length > 0);
  }

  const renderContent = () => {
    switch (appState) {
      case 'connecting':
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-headline">Starting session...</h2>
                <p className="text-muted-foreground">Please allow screen sharing permissions.</p>
            </div>
        )
      case 'creating':
      case 'joining':
        return (
          <div className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline">1. Your Info</CardTitle>
                <CardDescription>Copy and send this to your peer.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <Textarea value={mySessionInfo} readOnly className="h-full resize-none font-code text-xs" />
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => copyToClipboard(mySessionInfo)}>
                  <Clipboard className="mr-2" /> Copy
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline">2. Peer's Info</CardTitle>
                <CardDescription>Paste the info from your peer here.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <Textarea placeholder="Paste peer info here..." onChange={handlePeerInfoChange} className="h-full resize-none font-code text-xs" />
              </CardContent>
              <CardFooter>
                {appState === 'joining' ? (
                  <Button className="w-full" onClick={joinSession} disabled={!isPeerInfoPasted}>
                    Create My Info
                  </Button>
                ) : (
                  <Button className="w-full bg-accent hover:bg-accent/90" onClick={connectToPeer} disabled={!isPeerInfoPasted}>
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
             <div className="md:col-span-2 flex justify-center">
                 <Button variant="destructive" onClick={hangUp}>Cancel</Button>
             </div>
          </div>
        );
      case 'connected':
        return (
          <div className="w-full max-w-6xl h-[75vh] flex flex-col gap-4">
            <div className="relative flex-1 bg-black rounded-lg overflow-hidden border-2 border-primary shadow-2xl">
              <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
              <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-48 lg:w-64 rounded-lg border-2 border-secondary shadow-lg transition-all hover:scale-110 origin-bottom-right" />
            </div>
            <div className="flex justify-center items-center gap-4">
              <QualityOptimizer currentAudioQuality="Stereo, 128kbps" currentVideoQuality="1080p, 30fps" />
              <Button size="lg" variant="destructive" onClick={hangUp} className="rounded-full px-6 py-3">
                <PhoneOff className="mr-2" /> End Session
              </Button>
            </div>
          </div>
        );
      case 'idle':
      default:
        return (
          <Card className="max-w-md text-center">
            <CardHeader>
              <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                <Share className="h-8 w-8" />
              </div>
              <CardTitle className="text-4xl font-headline text-primary">PeerLink</CardTitle>
              <CardDescription>Simple, secure, one-to-one screen sharing.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="w-full" onClick={createSession}>
                Create Session
              </Button>
              <Button size="lg" variant="secondary" className="w-full" onClick={() => setAppState('joining')}>
                Join Session
              </Button>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">Powered by WebRTC for a direct, peer-to-peer connection.</p>
            </CardFooter>
          </Card>
        );
    }
  };

  return <div className="w-full h-full flex items-center justify-center">{renderContent()}</div>;
}
