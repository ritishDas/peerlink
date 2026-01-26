import { createUserWithEmailAndPassword, sendEmailVerification, } from "firebase/auth";

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { auth } from "@/firebaseConfig";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [cpassword, setCPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const [passerror, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {

      if (password !== cpassword) {
        setError("Passwords didn't match");
        return;
      }

      await createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          // Signed up 
          const user = userCredential.user;
          console.log(user);
          await sendEmailVerification(userCredential.user);
          // ...
        })

      console.log("Verification email sent");
      console.log("Registered in:")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="cpassword">Confirm Password</FieldLabel>
                </div>
                <Input
                  id="cpassword"
                  type="password"
                  required
                  value={cpassword}
                  onChange={(e) => setCPassword(e.target.value)}
                />
              </Field>

              {passerror !== "" && <span className="text-red-500">{passerror}</span>}
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Registering" : "Register"}
                </Button>


                <FieldDescription className="text-center">
                  Already have an account? <a href="/login">Login</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

