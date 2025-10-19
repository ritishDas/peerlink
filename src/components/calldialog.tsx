import { Phone, PhoneMissed } from 'lucide-react';
import Contactcard from "./contactcard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '../components/ui/button';
import { callAccept, callReject } from '../calling';
import { useCall } from '../statemng/calling';
import { useNavigate } from 'react-router-dom';
import { usePage } from '@/statemng/callpage';
type CardProps = { name: string; email: string; photoURL: string, type:string };

function Card({ name, email, photoURL, type }: CardProps) {
  const navigate = useNavigate();
const {setCp} = usePage();
  const handleAccept = async() => {
    await callAccept();
 if (window.innerWidth < 768) {
          navigate('/call');
    }
    else{
      setCp(true);
    }
    
  };

  const handleReject = async() => {
    await callReject();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      <Contactcard name={name} email={email} photoURL={photoURL} />
      <div className="flex space-x-5">
      {type==="incoming"&&<Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleAccept} className="bg-green-400" size="icon">
              <Phone />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Accept</TooltipContent>
        </Tooltip>}

        <Tooltip>
          <TooltipTrigger asChild>
              <Button onClick={handleReject} className="bg-red-500" size="icon">
                <PhoneMissed />
              </Button>
          </TooltipTrigger>
          <TooltipContent>Reject</TooltipContent>
        </Tooltip>
      </div> 
    </div>
  );
}

export default function Calldialog() {
  const { call } = useCall();
  if(!call.status) return <></>
  const caller = {...call.user, type:call.type};

  return (
    <Dialog
      open={call.status&&!call.answered}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>

        {call.type==="incoming"?<DialogTitle>Incoming Call</DialogTitle>:<DialogTitle>Outgoing Call</DialogTitle>}
        {call.type==="incoming"?<DialogDescription>{caller.name} is calling you</DialogDescription>
:<DialogDescription>Calling {caller.name}</DialogDescription>}
                  </DialogHeader>
        <Card {...caller}/>
        <div className="flex justify-end mt-4">
        </div>
      </DialogContent>
    </Dialog>
  );
}

