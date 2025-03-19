import { Link, useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [_, setLocation] = useLocation();
  const { user, isLoading, logout } = useAuth();
  
  // Helper to navigate without causing location format issues
  const navigate = (path: string) => {
    // Ensure path starts with a single slash
    const normalizedPath = path.replace(/^\/*/, '/');
    setLocation(normalizedPath);
  };
  
  // Handle sign out using the context
  const handleSignOut = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.5M13.5 3L19 8.5M13.5 3V7C13.5 7.82843 14.1716 8.5 15 8.5H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 17H15M9 13H15M9 9H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <Link href="/" className="ml-2 text-xl font-bold text-gray-900">
                TinyLink
              </Link>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          ) : user ? (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-gray-700" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="bg-primary text-white hover:bg-blue-600" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
