import {Phone, UserPlus} from 'lucide-react';
import Contactcard from "../components/contactcard";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '../components/ui/button';
import { initiateCall } from '../calling';

export default function Contact() {
  function Card({name, email, photoURL}:{name:string, email:string, photoURL:string}){
    return <div className='flex justify-between items-center p-2 border shadow-sm rounded-md mx-5'>
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
    <Button className="cursor-pointer"  size="icon" variant="outline">
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
  <Card name="ritish" email="ritishdas116@gmail.com" photoURL="./google.webp"/> 
  <Card name="dummyrd" email="dummyrd116@gmail.com" photoURL="./google.webp"/> 
  </div>;
}
