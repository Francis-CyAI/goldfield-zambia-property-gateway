
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, Building, Heart } from 'lucide-react';

const AuthButton = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
    );
  }

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user.email;

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user.email?.[0]?.toUpperCase() || 'U';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'institution_admin':
        return 'bg-blue-100 text-blue-800';
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'institution_admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return 'Student';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{displayName}</span>
            {profile?.role && (
              <Badge className={`text-xs ${getRoleBadgeColor(profile.role)}`}>
                {getRoleDisplayName(profile.role)}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          {profile?.role && (
            <Badge className={`text-xs w-fit ${getRoleBadgeColor(profile.role)}`}>
              {getRoleDisplayName(profile.role)}
            </Badge>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/bookings" className="flex items-center w-full">
            <Heart className="h-4 w-4 mr-2" />
            My Bookings
          </Link>
        </DropdownMenuItem>
        
        {(profile?.role === 'institution_admin' || profile?.role === 'super_admin') && (
          <DropdownMenuItem asChild>
            <Link to="/admin/properties" className="flex items-center w-full">
              <Building className="h-4 w-4 mr-2" />
              Manage Properties
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="h-4 w-4 mr-2" />
          {isLoading ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;
