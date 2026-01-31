import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface SalesAgentAvatarProps {
  firstName: string;
  lastName: string;
  photo?: string;
  className?: string;
}

export function SalesAgentAvatar({ firstName, lastName, photo, className }: SalesAgentAvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  
  return (
    <Avatar className={className}>
      {photo && <AvatarImage src={photo} alt={`${firstName} ${lastName}`} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
