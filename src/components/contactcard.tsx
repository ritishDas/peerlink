import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface ContactCardProps {
  name: string;
  email: string;
  photoURL: string;
}

export default function ContactCard({ name, email, photoURL }: ContactCardProps) {
  return (
    <Card className="p-2 border-0 shadow-none">
      <CardContent className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={photoURL} alt={`${name} profile picture`} />
          <AvatarFallback>{name ? name[0].toUpperCase() : "U"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h2 className="font-extrabold text-sm">{name}</h2>
          <h3 className="font-extralight text-xs text-gray-500">{email}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

