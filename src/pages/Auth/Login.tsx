
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader } from '@/components/Loader';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login successful",
        description: "Welcome back to SafeBite!",
      });
      navigate('/dashboard');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Simulate Google API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Google login successful",
        description: "Welcome to SafeBite!",
      });
      navigate('/dashboard');
    }, 1500);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    
    // Simulate guest login process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Guest access granted",
        description: "Welcome to SafeBite! Some features may be limited in guest mode.",
      });
      
      // Set a guest user flag in localStorage
      localStorage.setItem('userType', 'guest');
      navigate('/dashboard');
    }, 1000);
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
            className="sci-fi-button-purple"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <User className="mr-2 h-4 w-4" />
            Guest
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-safebite-text-secondary">Don't have an account? </span>
          <Link to="/auth/signup" className="text-safebite-teal hover:text-safebite-teal/80">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
