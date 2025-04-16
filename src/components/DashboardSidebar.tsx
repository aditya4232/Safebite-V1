
import React from 'react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useGuestMode } from '@/hooks/useGuestMode';
import { Button } from "@/components/ui/button";
import {
  Home, BarChart2, Pizza, Users, Settings, Menu, X,
  Search, Heart, LogOut, Activity, Calculator, Stethoscope,
  Zap, BookOpen, Bot, ShoppingCart, Sparkles, ShoppingBag, Badge, Utensils,
  UserCircle, HelpCircle, Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebase";
import ProfilePopup from './ProfilePopup';
import { getGuestName } from '@/services/guestUserService';

interface DashboardSidebarProps {
  userProfile: any;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const user = auth.currentUser;
  const { isGuest, exitGuestMode } = useGuestMode();
  const guestName = getGuestName() || 'Guest';

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      // If in guest mode, just exit guest mode
      if (isGuest) {
        exitGuestMode();
        toast({
          title: "Exited guest mode",
          description: "Thank you for trying SafeBite!",
        });
        navigate('/');
        return;
      }

      // Regular user logout
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
    { path: '/dashboard', name: 'Dashboard', icon: <Home size={20} />, guestAccess: true },
    { path: '/nutrition', name: 'Nutrition', icon: <Utensils size={20} className="text-safebite-teal" />, guestAccess: false },
    { path: '/recipes', name: 'Recipes', icon: <Pizza size={20} />, guestAccess: false },
    { path: '/grocery-products', name: 'Grocery Products', icon: <ShoppingCart size={20} className="text-safebite-teal" />, badge: <span className="ml-2 text-xs bg-safebite-teal/20 text-safebite-teal px-1.5 py-0.5 rounded-full">New</span>, guestAccess: false },
    { path: '/food-delivery', name: 'Food Delivery', icon: <Truck size={20} className="text-orange-400" />, badge: <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">Coming Soon</span>, guestAccess: false },
    { path: '/community', name: 'Community', icon: <Users size={20} />, guestAccess: false },
    { path: '/healthbox', name: 'HealthBox', icon: <Stethoscope size={20} className="text-safebite-teal" />, guestAccess: false },
    { path: '/health-check', name: 'Health Check', icon: <Heart size={20} />, guestAccess: false }, // Corrected path
    { path: '/reports', name: 'Reports', icon: <BarChart2 size={20} />, guestAccess: false },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} />, guestAccess: false },
    { path: '/help', name: 'Help', icon: <HelpCircle size={20} className="text-safebite-teal" />, badge: <span className="ml-2 text-xs bg-safebite-teal/20 text-safebite-teal px-1.5 py-0.5 rounded-full">New</span>, guestAccess: true },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-safebite-card-bg border-safebite-card-bg-alt hover:bg-safebite-teal/10 hover:border-safebite-teal/50 transition-all duration-300 shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} className="text-safebite-teal" /> : <Menu size={20} className="text-safebite-teal" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-safebite-dark-blue border-r border-safebite-card-bg-alt transform transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-safebite-card-bg-alt">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-safebite-teal to-safebite-purple flex items-center justify-center mr-3">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple">SafeBite</h2>
                <p className="text-xs text-safebite-text-secondary">
                  Smart Food Safety
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-2 px-4">
              {navLinks.map((link) => (
                (!isGuest || link.guestAccess) && (
                  <li key={link.path}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center py-2 px-4 rounded-md transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-safebite-teal to-safebite-teal/80 text-safebite-dark-blue font-medium shadow-sm shadow-safebite-teal/20'
                            : 'text-safebite-text hover:bg-safebite-card-bg-alt hover:border-safebite-teal/20 hover:pl-5'
                        }`
                      }
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.name}
                      {link.badge && link.badge}
                    </NavLink>
                  </li>
                )
              ))}
            </ul>
          </nav>

          {/* User section & Logout */}
          <div className="p-4 border-t border-safebite-card-bg-alt">
            <Button
              variant="ghost"
              className="flex items-center space-x-3 mb-4 w-full hover:bg-safebite-card-bg-alt rounded-md p-2"
              onClick={() => setShowProfilePopup(true)}
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-safebite-teal/30 to-safebite-purple/30 flex items-center justify-center text-safebite-teal border border-safebite-teal/50">
                  {isGuest ? 'G' : user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-safebite-card-bg border border-safebite-card-bg-alt flex items-center justify-center">
                  {isGuest ?
                    <Zap size={12} className="text-yellow-500" /> :
                    <Badge size={12} className="text-safebite-teal" />}
                </div>
              </div>
              <div className="text-left">
                <p className="text-safebite-text font-medium">
                  {isGuest ? guestName : (user?.displayName || user?.email || 'User')}
                </p>
                <p className="text-xs text-safebite-text-secondary flex items-center">
                  {isGuest ?
                    <><Zap size={12} className="text-yellow-500 mr-1" /> Guest Mode</> :
                    <><Badge size={12} className="text-safebite-teal mr-1" /> Premium Member</>}
                </p>
              </div>
              <UserCircle size={16} className="ml-auto text-safebite-teal" />
            </Button>

            <Button
              variant="outline"
              className="w-full sci-fi-button flex items-center justify-center hover:border-safebite-teal/50 transition-all duration-300"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Profile Popup */}
      <ProfilePopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        userProfile={userProfile}
      />
    </>
  );
};

export default DashboardSidebar;
