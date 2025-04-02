import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../main";
import { useToast } from "@/hooks/use-toast";
import Loader from '@/components/Loader';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user is in Firestore "adminUsers" collection
      const adminDoc = await getDoc(doc(db, "adminUsers", user.email));

      if (adminDoc.exists()) {
        localStorage.setItem("isAdmin", "true");
        navigate('/admin/panel'); // Redirect
      } else {
        toast({
          title: "Access Denied",
          description: "You are not authorized to access the admin panel.",
          variant: "destructive",
        });
        setError("Access Denied: You are not an admin.");
        await auth.signOut(); // Sign out unauthorized user
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue flex items-center justify-center p-4">
      <Card className="sci-fi-card max-w-md w-full p-6">
        <h2 className="text-2xl font-bold gradient-text text-center mb-4">Admin Login</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md flex items-center text-red-300">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        <div>
          <Button
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? <Loader size="sm" className="mr-2" /> : null}
            Sign In with Google
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
