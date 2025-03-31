
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock password reset request for now
      setTimeout(() => {
        console.log('Password reset email sent to:', email);
        setIsSuccess(true);
        toast({
          title: "Reset link sent",
          description: "If your email exists in our system, you'll receive a reset link shortly.",
        });
      }, 1500);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-safebite-dark-blue">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold gradient-text mb-2">Forgot Password</h1>
          <p className="text-safebite-text-secondary">We'll send you a link to reset your password</p>
        </div>

        <div className="sci-fi-card">
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded-md flex items-center text-red-300">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-safebite-text">Check Your Email</h3>
              <p className="text-safebite-text-secondary mb-6">
                We've sent a password reset link to <span className="text-safebite-teal">{email}</span>.
                Follow the instructions in the email to reset your password.
              </p>
              <Button 
                variant="outline" 
                className="sci-fi-button"
                onClick={() => setIsSuccess(false)}
              >
                Back to Reset
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
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
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/auth/login" className="inline-flex items-center text-safebite-teal hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
