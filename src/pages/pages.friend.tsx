import {Phone} from 'lucide-react';
import Contactcard from "../components/contactcard";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '../components/ui/button';
import { initiateCall } from '../calling';

export default function Friend() {
  function Card({name, email, photoURL}:{name:string, email:string, photoURL:string}){
    return <div className='flex justify-between items-center p-2 border shadow-sm rounded-md mx-5'>
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
 <Card name="ritish" email="ritishdas@gmail.com" photoURL="./google.webp"/> 
  </div>;
}
