import { useState } from "react"
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { initiateCall } from "../calling";

export default function Dialpad() {
  const [email, setEmail] = useState("");
return <div className="h-full">
  <h2 className='text-2xl font-bold mt-15 ml-10'>Dialpad</h2>
  <div className='w-25 h-1 bg-black rounded-md ml-10 mb-10'> </div>
  <div className=" flex justify-center">
  <div className="w-100 border-1 border-black rounded-sm p-10 flex flex-col gap-y-5">
  <label>Enter Email Of Callee</label>
    <input type="email" className="rounded-xs bg-white border border-black outline-none p-2 h-10" onChange={e => setEmail(e.target.value)} value={email}/>
<Button className="bg-green-400" onClick={() => initiateCall(email)}><Phone/>Call</Button>
  </div>
</div>
  </div>
}
