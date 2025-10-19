import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStore } from "../statemng/zustand";
import { logout, googleLogin } from "../auth";
import { Link } from "react-router-dom";

export default function Navbar({ name, photoURL }: { name: string; photoURL?: string }) {
  const {login} = useStore();
  return (
    <nav className="w-full border-b bg-background shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
        <Link to='/'> <h1 className="text-xl font-bold tracking-tight">Peerlink</h1> </Link>
        </div>

        {/* Right side: user info */}
        {login.status? <div className="flex items-center gap-3">
          <Separator orientation="vertical" className="h-6" />
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={photoURL} alt="profile picture" />
            <AvatarFallback>
              {name ? name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <Button onClick={logout} variant="destructive">
          Logout
          </Button>
        </div>:
          <Button onClick={googleLogin} variant="outline">
        Login
          </Button>
        }

      </div>
    </nav>
  )
}


