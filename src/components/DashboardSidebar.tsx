
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Home, BarChart2, Pizza, Users, Settings, Menu, X,
  Search, Heart, LogOut, Activity, Calculator, Stethoscope,
  Zap, BookOpen, Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebase";

const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
        description: "Thank you for using SafeBite!",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: <Home size={20} /> },
    { path: '/food-search', name: 'Food Search', icon: <Search size={20} /> },
    { path: '/recipes', name: 'Recipes', icon: <Pizza size={20} /> },
    { path: '/community', name: 'Community', icon: <Users size={20} /> },
    { path: '/healthbox', name: 'HealthBox', icon: <Stethoscope size={20} className="text-safebite-teal" /> },
    { path: '/weekly-questions', name: 'Health Check', icon: <Heart size={20} /> },
    { path: '/reports', name: 'Reports', icon: <BarChart2 size={20} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-safebite-card-bg border-safebite-card-bg-alt"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-safebite-dark-blue border-r border-safebite-card-bg-alt transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-safebite-card-bg-alt">
            <h2 className="text-2xl font-bold gradient-text">SafeBite</h2>
            <p className="text-xs text-safebite-text-secondary mt-1">
              Smart Food Safety
            </p>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-2 px-4">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center py-2 px-4 rounded-md transition-colors ${
                        isActive
                          ? 'bg-safebite-teal text-safebite-dark-blue font-medium'
                          : 'text-safebite-text hover:bg-safebite-card-bg-alt'
                      }`
                    }
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User section & Logout */}
          <div className="p-4 border-t border-safebite-card-bg-alt">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-safebite-card-bg-alt flex items-center justify-center text-safebite-teal">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-safebite-text font-medium">{user?.displayName || user?.email || 'Alex Smith'}</p>
                <p className="text-xs text-safebite-text-secondary">Premium member</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full sci-fi-button flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
