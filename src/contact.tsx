import { Contact, Handshake, History, Phone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Contactcomp from './pages/pages.contact';
import Calldialog from '@/components/calldialog';
import Friend from './pages/pages.friend';
import Recent from './pages/pages.recent';
import { useEffect, useState } from 'react';
import { useCall } from './statemng/calling';
import { useStore } from './statemng/zustand';
import { db } from './firebaseConfig';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';

export default function Contacts() {
  const [page, setPage] = useState('contacts');
  const {setCall} = useCall();
  const {login} = useStore();

useEffect(() => {
    if (!login.status) return;

    const callsRef = collection(db, "calls");
    // listen for calls where current user is the callee and not yet accepted
    const q = query(callsRef, where("callee", "==", login.user.id), where("accepted", "==", false));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        // get the most recent incoming call (you can choose snapshot.docs[0])
        const callDoc = snapshot.docs[0].data();
        const callerId = callDoc.caller;

        // fetch caller user data from 'users' collection
        const callerRef = doc(db, "users", callerId);
        const callerSnap = await getDoc(callerRef);

        if (callerSnap.exists()) {
          const caller = callerSnap.data(); // { name, email, photoURL }

          setCall({
            status: true,
            type: "incoming",
            id:snapshot.docs[0].id,
            user: {
              name: caller.name,
              email: caller.email,
              photoURL: caller.photoURL,
            },
          });
        }
      }
      else {
          setCall({
            status: false,
          })

      }
    });
// handling outgoing calls
    const outcall = query(callsRef, where("caller", "==", login.user.id), where("accepted", "==", false));
    const subscribe = onSnapshot(outcall, async (snapshot) => {
      if (!snapshot.empty) {
        // get the most recent incoming call (you can choose snapshot.docs[0])
        const callDoc = snapshot.docs[0].data();
        const calleeId = callDoc.callee;

        // fetch caller user data from 'users' collection
        const calleeRef = doc(db, "users", calleeId);
        const calleeSnap = await getDoc(calleeRef);

        if (calleeSnap.exists()) {
          const caller = calleeSnap.data(); // { name, email, photoURL }

          setCall({
            status: true,
            type: "outgoing",
            id:snapshot.docs[0].id,
            user: {
              name: caller.name,
              email: caller.email,
              photoURL: caller.photoURL,
            },
          });
        }
      }
      else {
          setCall({
            status: false,
          })

      }
    });
    return () => {
      unsubscribe();
      subscribe();
    };
  }, [login]);
  let component;
  if (page === 'recents') component = <Recent />;
  else if (page === 'friends') component = <Friend />;
  else component = <Contactcomp />;

  return (
    <div className="flex h-[90vh]">
    <Calldialog/>
    
      <TooltipProvider>
        <div className="flex h-full p-5 border border-r-gray-500 gap-y-10 flex-col items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <History onClick={() => setPage('recents')} className="cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>Recents</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Handshake onClick={() => setPage('friends')} className="cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>Friends</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Contact onClick={() => setPage('contacts')} className="cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>Contacts</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Phone className="cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>New Call</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="flex-1">{component}</div>
    </div>
  );
}

