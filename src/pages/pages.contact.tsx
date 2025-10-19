import {Phone, UserPlus} from 'lucide-react';
import Contactcard from "../components/contactcard";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '../components/ui/button';
import { initiateCall } from '../calling';
import { useEffect, useState } from 'react';
import { useStore } from '../statemng/zustand';
import { getDoc } from 'firebase/firestore';
import {  addFriend, fetchContacts as fc } from '../db';

export default function Contact() {

  const {login} = useStore();

  const [contact, setContact] = useState<any[]>([]);
 useEffect(() => {
    if (!login.status) return;

    const fetchContacts = async () => {
      try {

        const contacts = await fc(login.user.email)
        if(!contacts) return;
        const contactPromises = contacts.data.map(async (entry: any) => {
          let contactRef;

            contactRef = entry;

          const contactSnap = await getDoc(contactRef);
          if (!contactSnap.exists()) return null;
          return { id: contactSnap.id, ...(contactSnap.data() ?? {}) };
        });

        const resolvedContacts = (await Promise.all(contactPromises)).filter(Boolean);
        setContact(resolvedContacts);
        console.log("Resolved contacts:", resolvedContacts);
      } catch (err) {
        console.error("Error fetching contacts:", err);
     
      }
    };

    fetchContacts();
  }, []);
// Empty dependency array is correct for a one-time fetch
  function Card({name, email, photoURL}:{name:string, email:string, photoURL:string }){

    return <div className='flex justify-center space-x-5 flex-wrap items-center p-2 border shadow-sm rounded-md mx-5'>
    <Contactcard name={name} email={email} photoURL={photoURL}/>
    <div className='flex space-x-5 items-center'>
    <Tooltip>
    <TooltipTrigger asChild>
    <Button onClick={() => initiateCall(email)} className="cursor-pointer"  size="icon" variant="outline">
    <Phone/>
    </Button>
    </TooltipTrigger>
    <TooltipContent>Call</TooltipContent>
    </Tooltip>

    <Tooltip>
    <TooltipTrigger asChild>
    <Button onClick={async() => {if(!login.status)return;addFriend({user:login.user.email, friend:email})}} className="cursor-pointer" size="icon" variant="outline">
    <UserPlus/>
    </Button>
    </TooltipTrigger>
    <TooltipContent>Add To Friends</TooltipContent>
    </Tooltip>
      
    </div>
    </div>
  }

  return <div>
  <h2 className='text-2xl font-bold mt-15 ml-10'>Contacts</h2>
  <div className='w-25 h-1 bg-black rounded-md ml-10 mb-10'> </div>

  {contact.map((entry, ind) => 
  <Card name={entry.name} key={ind} email={entry.id} photoURL={entry.photoURL}/> 
  )}

  </div>;
}
