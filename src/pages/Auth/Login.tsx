import React, { useState, useEffect } from 'react'; // Add React import back
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Loader from '@/components/Loader';
import { Eye, EyeOff, Mail, Lock, UserCircle, AlertCircle, Info } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "../../firebase";
import guestAuthService from "@/services/guestAuthService";
import GuestNameDialog from "@/components/GuestNameDialog";
import { getGuestName } from "@/services/guestUserService";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestInfo, setShowGuestInfo] = useState(false);
  const [showGuestNameDialog, setShowGuestNameDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const auth = getAuth(app); // Get the auth instance

  // Check if user came from guest login link
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('guest') === 'true') {
      setShowGuestInfo(true);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful",
        description: "Welcome back to SafeBite!",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Google login successful",
        description: "Welcome to SafeBite!",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle guest login
  const handleGuestLogin = async () => {
    const existingGuestName = getGuestName(); // Check session storage

    if (existingGuestName) {
      // If name already exists in session, sign in directly
      setIsLoading(true);
      try {
        await guestAuthService.signInAsGuest(existingGuestName);
        toast({
          title: "Welcome back, " + existingGuestName,
          description: "You're continuing your guest session.",
        });
        navigate('/dashboard');
      } catch (error: any) {
        console.error("Guest login error:", error);
        toast({
          title: "Guest login failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Otherwise, show the dialog to get the name
      setShowGuestNameDialog(true);
    }
  };

  // Handle guest name submission from the dialog
  const handleGuestNameSubmit = async (name?: string) => {
    setShowGuestNameDialog(false);

    if (!name) return; // User cancelled or closed dialog

    setIsLoading(true);
    try {
      // Name is already set in sessionStorage by GuestNameDialog via setGuestName service function
      // Remove incorrect localStorage usage:
      // localStorage.setItem('guestName', name);
      // localStorage.setItem('guestNameSet', 'true');

      await guestAuthService.signInAsGuest(name);
      toast({
        title: "Welcome, " + name,
        description: "You're now using SafeBite in guest mode. Your data won't be saved permanently.",
      });
      // Add more detailed logging for guest login
      console.log('Guest login successful, navigating to dashboard', {
        guestName: name,
        guestMode: sessionStorage.getItem('safebite-guest-mode'),
        userType: localStorage.getItem('userType'),
        guestSessionExpires: localStorage.getItem('guestSessionExpires')
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Guest login error:", error);
      toast({
        title: "Guest login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle guest info panel
  const toggleGuestInfo = () => {
    setShowGuestInfo(!showGuestInfo);
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue flex items-center justify-center p-4">
      <Card className="sci-fi-card max-w-md w-full p-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold gradient-text mb-2">SafeBite</h1>
          <p className="text-safebite-text-secondary">Sign in to access your health dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-safebite-text-secondary" />
              <Input
                id="email"
                placeholder="your.email@example.com"
                type="email"
                className="sci-fi-input pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/auth/forgot-password" className="text-xs text-safebite-teal hover:text-safebite-teal/80">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-safebite-text-secondary" />
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                className="sci-fi-input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-safebite-text-secondary" />
                ) : (
                  <Eye className="h-5 w-5 text-safebite-text-secondary" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            disabled={isLoading}
          >
            {isLoading ? <Loader size="sm" className="mr-2" /> : null}
            Sign In
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-safebite-card-bg-alt"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-safebite-card-bg px-2 text-safebite-text-secondary">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="sci-fi-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
              <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
              <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
              <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <Button
            variant="outline"
            className="sci-fi-button"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Guest
          </Button>
        </div>

        {/* Guest Mode Info Panel */}
        {showGuestInfo && (
          <div className="mt-4 p-3 bg-safebite-teal/10 border border-safebite-teal/30 rounded-md">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-safebite-teal mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-safebite-text mb-1">About Guest Mode</h4>
                <ul className="text-xs text-safebite-text-secondary space-y-1 list-disc pl-4">
                  <li>Access all features and tools without registration</li>
                  <li>Your data won't be saved when you leave</li>
                  <li>No personalized recommendations over time</li>
                  <li>Create an account anytime to save your progress</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-safebite-text-secondary">Don't have an account? </span>
            <button
              onClick={toggleGuestInfo}
              className="text-xs text-safebite-teal hover:text-safebite-teal/80 flex items-center"
              type="button"
            >
              <Info className="h-3 w-3 mr-1" />
              {showGuestInfo ? 'Hide' : 'About'} guest mode
            </button>
          </div>
          <div className="flex justify-center space-x-4">
            <Link to="/auth/signup" className="text-safebite-teal hover:text-safebite-teal/80">
              Sign up
            </Link>
          </div>
        </div>
      </Card>

      {/* Guest Name Dialog */}
      <GuestNameDialog
        open={showGuestNameDialog}
        onClose={handleGuestNameSubmit}
      />
    </div>
  );
};

export default Login;
