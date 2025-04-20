import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, ChevronDown, User, LogOut, MessageCircle, Briefcase } from "lucide-react";
import { UserType } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-primary font-bold text-xl">
              Skill<span className="text-secondary">Match</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link href="/find-jobs" className={`font-medium ${location === '/find-jobs' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Find Jobs
            </Link>
            <Link href="/find-workers" className={`font-medium ${location === '/find-workers' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
              Find Workers
            </Link>
            {user && user.userType === UserType.WORKER && (
              <Link href="/worker-dashboard" className={`font-medium ${location === '/worker-dashboard' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                Dashboard
              </Link>
            )}
            {user && user.userType === UserType.EMPLOYER && (
              <Link href="/employer-dashboard" className={`font-medium ${location === '/employer-dashboard' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                Dashboard
              </Link>
            )}
          </div>

          {/* Authentication / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || ""} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.userType === UserType.WORKER ? (
                      <DropdownMenuItem asChild>
                        <Link href="/worker-dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/employer-dashboard" className="cursor-pointer">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="cursor-pointer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 divide-y">
            <div className="py-2">
              <Link 
                href="/find-jobs" 
                className={`block py-2 font-medium ${location === '/find-jobs' ? 'text-primary' : 'text-gray-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Jobs
              </Link>
              <Link 
                href="/find-workers" 
                className={`block py-2 font-medium ${location === '/find-workers' ? 'text-primary' : 'text-gray-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Workers
              </Link>
              {user && user.userType === UserType.WORKER && (
                <Link 
                  href="/worker-dashboard" 
                  className={`block py-2 font-medium ${location === '/worker-dashboard' ? 'text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Worker Dashboard
                </Link>
              )}
              {user && user.userType === UserType.EMPLOYER && (
                <Link 
                  href="/employer-dashboard" 
                  className={`block py-2 font-medium ${location === '/employer-dashboard' ? 'text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Employer Dashboard
                </Link>
              )}
              {user && (
                <Link 
                  href="/messages" 
                  className={`block py-2 font-medium ${location === '/messages' ? 'text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
              )}
            </div>
            
            <div className="pt-2">
              {user ? (
                <>
                  <div className="flex items-center py-2">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={user.avatar || ""} alt={user.fullName} />
                      <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 px-0"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/auth" 
                    className="block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link 
                    href="/auth?tab=register" 
                    className="block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
