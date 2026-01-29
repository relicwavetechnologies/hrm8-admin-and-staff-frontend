import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface EntityAvatarProps {
  src?: string;
  name: string;
  type?: 'logo' | 'person';
  size?: 'sm' | 'md' | 'lg';
}

export function EntityAvatar({ src, name = '', type = 'person', size = 'md' }: EntityAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const getInitials = (name: string) => {
    if (!name || name.trim().length === 0) {
      return '??';
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string) => {
    if (!name || name.trim().length === 0) {
      return 'bg-gray-500';
    }
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Determine shape based on type AND whether image exists
  const getShapeClass = () => {
    if (type === 'logo' && src) {
      // Company logo with image: square with subtle rounding
      return 'rounded-md';
    }
    // All other cases: circular (logo fallback, person with/without photo)
    return 'rounded-full';
  };

  // Determine background color class
  const getBackgroundClass = () => {
    if (src && type === 'logo') {
      // Logo with image: transparent background
      return 'bg-transparent';
    }
    // Fallback: colored background
    return getBackgroundColor(name);
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${getShapeClass()}`}>
      <AvatarImage 
        src={src} 
        alt={name}
        className={type === 'logo' && src ? 'object-contain p-1' : 'object-cover'}
      />
      <AvatarFallback className={`${getBackgroundClass()} text-white`}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
