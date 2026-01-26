import { LoginForm } from "./login-form"

export default function AuthSection() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      {/* <Card className="w-full max-w-sm shadow-lg border border-border"> */}
      {/*   <CardHeader> */}
      {/*     <CardTitle className="text-center text-xl font-semibold"> */}
      {/*       You Need To Login First */}
      {/*     </CardTitle> */}
      {/*   </CardHeader> */}
      {/* <CardContent className="flex flex-col items-center gap-4"> */}

      {/* <Button */}
      {/*   onClick={googleLogin} */}
      {/*   variant="outline" */}
      {/*   className="flex items-center gap-2 w-full justify-center" */}
      {/* > */}
      {/*   <img src="./google.webp" className="w-8" alt="google logo" /> */}
      {/*   Login with Google */}
      {/* </Button> */}
      {/* </CardContent> */}
      {/* </Card> */}
      <LoginForm className="w-100" />
    </div>
  )
}
