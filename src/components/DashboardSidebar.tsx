
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, User, Search, Utensils, Activity, 
  MessageSquare, Bell, Settings, LogOut, Menu, X 
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, icon: Icon, label, isActive, onClick 
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
        isActive 
          ? 'bg-safebite-teal/20 text-safebite-teal border-l-2 border-safebite-teal' 
          : 'text-safebite-text hover:bg-safebite-card-bg-alt hover:text-safebite-teal'
      }`}
      onClick={onClick}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const DashboardSidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // TODO: Handle logout logic
    console.log('Logging out...');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/food-search', icon: Search, label: 'Food Search' },
    { to: '/nutrition', icon: Utensils, label: 'Nutrition' },
    { to: '/health', icon: Activity, label: 'Health Metrics' },
    { to: '/community', icon: MessageSquare, label: 'Community' },
  ];

  const bottomNavLinks = [
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <Button
          variant="ghost"
          onClick={toggleMobileMenu}
          className="text-safebite-text hover:text-safebite-teal focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-safebite-card-bg border-r border-safebite-card-bg-alt fixed left-0 top-0 z-40">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold gradient-text">SafeBite</span>
          </Link>
        </div>

        <Separator className="bg-safebite-card-bg-alt" />

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                isActive={isActiveRoute(link.to)}
              />
            ))}
          </nav>
        </div>

        <Separator className="bg-safebite-card-bg-alt" />

        <div className="p-4">
          <nav className="space-y-1">
            {bottomNavLinks.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                isActive={isActiveRoute(link.to)}
              />
            ))}
            <Button
              variant="ghost"
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-safebite-text hover:bg-safebite-card-bg-alt hover:text-red-500 text-left"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-safebite-card-bg border-r border-safebite-card-bg-alt">
            <div className="p-6">
              <Link to="/dashboard" className="flex items-center" onClick={closeMobileMenu}>
                <span className="text-2xl font-bold gradient-text">SafeBite</span>
              </Link>
            </div>

            <Separator className="bg-safebite-card-bg-alt" />

            <div className="flex-1 overflow-y-auto py-4 px-3">
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <SidebarLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
                    isActive={isActiveRoute(link.to)}
                    onClick={closeMobileMenu}
                  />
                ))}
              </nav>
            </div>

            <Separator className="bg-safebite-card-bg-alt" />

            <div className="p-4">
              <nav className="space-y-1">
                {bottomNavLinks.map((link) => (
                  <SidebarLink
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
                    isActive={isActiveRoute(link.to)}
                    onClick={closeMobileMenu}
                  />
                ))}
                <Button
                  variant="ghost"
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-safebite-text hover:bg-safebite-card-bg-alt hover:text-red-500 text-left"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
