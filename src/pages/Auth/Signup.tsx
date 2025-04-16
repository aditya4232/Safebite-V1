import React, { useState } from 'react'; // Added React import
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Mail, Lock, User, AlertCircle, UserCircle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
// Import updateProfile
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { app } from "../../firebase";
import guestAuthService from "@/services/guestAuthService";

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGuestInfo, setShowGuestInfo] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);

  // Toggle guest info panel
  const toggleGuestInfo = () => {
    setShowGuestInfo(!showGuestInfo);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with the provided name
      await updateProfile(user, {
        displayName: name
      });

      toast({
        title: "Account created",
        description: `Welcome, ${name}! Please answer a few questions to personalize your experience.`,
      });
      // Redirect to questionnaire after signup
      navigate('/questionnaire');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user has a display name
      if (!user.displayName) {
        // Ask the user for their name
        const name = prompt("Welcome to SafeBite! Please enter your name:");

        // Update the user's profile with the provided name
        if (name) {
          await updateProfile(user, {
            displayName: name,
          });
        }
      }

      toast({
        title: "Account created",
        description: "Welcome to SafeBite! Let's get started with some questions.",
      });
      navigate('/questionnaire');
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle guest login
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await guestAuthService.signInAsGuest();
      toast({
        title: "Guest login successful",
        description: "You're now using SafeBite in guest mode. Your data won't be saved.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Guest login error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-safebite-dark-blue">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-safebite-text-secondary">Join SafeBite and start your health journey</p>
        </div>

        <div className="sci-fi-card">
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded-md flex items-center text-red-300">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-safebite-text">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-safebite-text-secondary" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="sci-fi-input pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-safebite-text">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-safebite-text-secondary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="sci-fi-input pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-safebite-text">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-safebite-text-secondary" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="sci-fi-input pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-safebite-text">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-safebite-text-secondary" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="sci-fi-input pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-safebite-dark-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
                  </span>
                )}
              </Button>

              <Separator className="my-6 bg-safebite-card-bg-alt" />

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-safebite-card-bg-alt text-safebite-text hover:bg-safebite-card-bg-alt"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="border-safebite-card-bg-alt text-safebite-text hover:bg-safebite-card-bg-alt"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserCircle className="mr-2 h-5 w-5" />
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
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <div className="flex justify-center items-center mb-2">
            <button
              onClick={toggleGuestInfo}
              className="text-xs text-safebite-teal hover:text-safebite-teal/80 flex items-center"
              type="button"
            >
              <Info className="h-3 w-3 mr-1" />
              {showGuestInfo ? 'Hide' : 'About'} guest mode
            </button>
          </div>
          <p className="text-safebite-text-secondary">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-safebite-teal hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
