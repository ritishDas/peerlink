import {Phone} from 'lucide-react';
import Contactcard from "../components/contactcard";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '../components/ui/button';
import { initiateCall } from '../calling';

export default function Recent() {

interface ContactCardProps {
  name: string;
  email: string;
  photoURL: string;
  timedate: Date;
}

function Card({ name, email, photoURL, timedate }: ContactCardProps) {
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
      <div className="flex justify-between items-center">
        <Contactcard name={name} email={email} photoURL={photoURL} />

        <Tooltip>
          <TooltipTrigger asChild>
    <Button onClick={() => initiateCall(name, email, photoURL)} className="cursor-pointer"  size="icon" variant="outline">
              <Phone />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Call Again</TooltipContent>
        </Tooltip>
      </div>

      <div className="text-center text-xs text-gray-500 mt-1">{formattedDate}</div>
    </div>
  );
}

  return <div>
<h2 className='text-2xl font-bold mt-15 ml-10'>Recents</h2>
<div className='w-25 h-1 bg-black rounded-md ml-10 mb-10'> </div>
 <Card name="ritish" email="ritishdas@gmail.com" photoURL="./google.webp" timedate={new Date()}/> 
  </div>;
}
