import { Contact, Handshake, History, Phone, VideoOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {  Routes, Route, useNavigate } from 'react-router-dom'
import Contactcomp from './pages/pages.contact';
import Calldialog from '@/components/calldialog';
import Friend from './pages/pages.friend';
import Recent from './pages/pages.recent';
import { useEffect, useState } from 'react';
import { useCall } from './statemng/calling';
import { useStore } from './statemng/zustand';
import { db } from './firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';
import Callpage from './pages/pages.call';
import Dialpad from './pages/pages.diappad';
import { checkCall } from './db';
import { usePage } from './statemng/callpage';

export default function Contacts() {
  const [page, setPage] = useState('contacts');
  const {setCall} = useCall();
  const {login} = useStore();
const {callpage, setCp} = usePage();
const navigate = useNavigate();
useEffect(() => {
    if (!login.status) return;

    async function checkcall() {
    if (!login.status) return;
    const call = await checkCall(login.user.email)
let type:'incoming'|'outgoing', id, user;
    if(call.status) {
      if(call.data.type === 'incoming'){
        id = call.data.id;
      type = 'incoming';
      user = call.data.data;
        }
        else {
        id = call.data.id;
      type = 'outgoing';
      user = call.data.data;
        }
        console.log('contact.tsx', call.data);
if(call.data.status === 'answered'){
          setCall({
            status: true,
            answered:true,
            type,
            id,
            user
          });
 if (window.innerWidth < 768) {
          navigate('/call');
    }
    else{
      setCp(true);
    }
}
else{
          setCall({
            status: true,
            answered:false,
            type,
            id,
            user
          });
}

    }
    else {

  setCp(false);
      setCall({status:false});
    }
    }

const q = query(collection(db, "calls"));
onSnapshot(q, (querySnapshot) => {
    
    querySnapshot.docChanges().forEach((change) => {

        console.log("New call received! 🔔", change.doc.data());
checkcall();        
    });
  }, (error) => {
    console.error("Error listening for calls:", error);
  });
  }, [login]);

  let component;
  if (page === 'recents') component = <Recent />;
  else if (page === 'friends') component = <Friend />;
  else if (page === 'contacts') component = <Contactcomp />;
  else component = <Dialpad/>;

  return (
  <Routes>
  <Route path="/" element={
    <div className="flex h-[78vh] overflow-scroll">
    <Calldialog/>
   <div className='h-[83vh] w-1 absolute bg-gray-300 left-15'> </div> 
      <TooltipProvider>
        <div className="flex h-full p-5  gap-y-10 flex-col items-center">
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
              <Phone onClick={() => setPage('dialpad')} className="cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>New Call</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="flex border justify-between w-full">
      <div className='md:w-1/3 overflow-scroll'>
      {component}
      </div>
      <div className='hidden md:block w-2/3 border border-r-black'>
      {callpage?<Callpage/>:<div className='flex justify-center items-center h-full'>
        <VideoOff size='200px'/>
      </div>}
      </div>
      </div>
    </div>
  } />

  <Route path="/call" element={<Callpage/>}/>
  </Routes>); 
}
