import {Phone} from 'lucide-react';
import Contactcard from "../components/contactcard";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '../components/ui/button';
import { initiateCall } from '../calling';
import { useStore } from '../statemng/zustand';
import { fetchFriends as ff } from '@/db';
import { useEffect, useState } from 'react';
import { getDoc } from 'firebase/firestore';
export default function Friend() {
  const {login} = useStore();
  const [friend, setFriend] = useState<any[]>([]);
 useEffect(() => {
    if (!login.status) return;

    const fetchFriends = async () => {
      try {

        const friends = await ff(login.user.email)
        if(!friends)return;
        const friendPromises = friends.data.map(async (entry: any) => {
          let friendRef;

            friendRef = entry;
          const friendSnap = await getDoc(friendRef);
          if (!friendSnap.exists()) return null;

          return { id: friendSnap.id, ...(friendSnap.data()??{})};
        });

        const resolvedFriends = (await Promise.all(friendPromises)).filter(Boolean);
console.log('useEffect',resolvedFriends);
        setFriend(resolvedFriends);
        console.log("Resolved friends:", resolvedFriends);
      } catch (err) {
        console.error("Error fetching friends:", err);
     
      }
    };

    fetchFriends();
  }, []);
  function Card({name, email, photoURL}:{name:string, email:string, photoURL:string}){
    return <div className='flex space-x-5 flex-wrap justify-between items-center p-2 border shadow-sm rounded-md mx-5'>
      <Contactcard name={name} email={email} photoURL={photoURL}/>
    <Tooltip>
    <TooltipTrigger asChild>
    <Button onClick={() => initiateCall( email )} className="cursor-pointer"  size="icon" variant="outline">
    <Phone/>
    </Button>
    </TooltipTrigger>
    <TooltipContent>Call</TooltipContent>
    </Tooltip>
    </div>
  }

  return <div>
<h2 className='text-2xl font-bold mt-15 ml-10'>Friends</h2>
<div className='w-25 h-1 bg-black rounded-md ml-10 mb-10'> </div>
  {friend.map((entry, ind) => 
  <Card name={entry.name} key={ind} email={entry.id} photoURL={entry.photoURL}/> 
  )}
  </div>;
}
