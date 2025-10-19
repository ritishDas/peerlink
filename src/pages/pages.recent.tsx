import {PhoneIncoming, PhoneOutgoing} from 'lucide-react';
import Contactcard from "../components/contactcard";
import { useStore } from '../statemng/zustand';
import { useEffect, useState } from 'react';
import { fetchRecents as fr } from '@/db';

export default function Recent() {

  const {login} = useStore();
  const [recent, setRecent] = useState<any[]>([]);
 useEffect(() => {
    if (!login.status) return;

    const fetchRecents = async () => {
      try {

        const recents = await fr(login.user.email)
        console.log('recents',recents)
        const recentPromises = recents.data.map(async (entry: any) => {
          

          return { ...entry.user, type:entry.type, time:entry.createdAt };
        });

        const resolvedRecents = (await Promise.all(recentPromises)).filter(Boolean);
console.log('useEffect',resolvedRecents);
        setRecent(resolvedRecents);
      } catch (err) {
        console.error("Error fetching recents:", err);
     
      }
    };

    fetchRecents();
  }, []);
interface ContactCardProps {
  type: 'outgoing'|'incoming'
  name: string;
  email: string;
  photoURL: string;
  timedate: Date;
}

function Card({ type, email, name, photoURL, timedate }: ContactCardProps) {
  // Format the date nicely
  const formattedDate = timedate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-5 my-2 border shadow-sm rounded-md p-2 ">
      <div className="flex justify-between items-center p-2">
        <Contactcard name={name} email={email} photoURL={photoURL} />

        {type === 'incoming'?<PhoneIncoming />: <PhoneOutgoing/>}
      </div>

      <div className="text-center text-xs text-gray-500 mt-1">{formattedDate}</div>
    </div>
  );
}

  return <div>
<h2 className='text-2xl font-bold mt-15 ml-10'>Recents</h2>
<div className='w-25 h-1 bg-black rounded-md ml-10 mb-10'> </div>
  {recent.map((entry, ind) => 
  <Card name={entry.name} key={ind} photoURL={entry.photoURL} type={entry.type} email={entry.email} timedate={entry.time.toDate()}/> 
  )}
  </div>;
}
