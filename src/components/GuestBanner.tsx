
import { AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const GuestBanner = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6 p-4 rounded-lg border border-safebite-purple bg-safebite-purple/10 flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle className="mr-3 h-5 w-5 text-safebite-purple" />
        <div>
          <p className="text-safebite-text font-medium">You're using SafeBite in guest mode</p>
          <p className="text-safebite-text-secondary text-sm">Some features are limited. Create an account to access all features.</p>
        </div>
      </div>
      <Button 
        onClick={() => navigate('/auth/signup')}
        className="bg-safebite-purple hover:bg-safebite-purple/80 text-white"
      >
        Sign Up
      </Button>
    </div>
  );
};

export default GuestBanner;
