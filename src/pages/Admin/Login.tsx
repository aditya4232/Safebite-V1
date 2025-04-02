import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      setError('Admin credentials not configured.');
      return;
    }

    if (username.trim() === adminUsername && password.trim() === adminPassword) {
      // Successful login
      navigate('/admin/panel');
    } else {
      setError('Invalid credentials');
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
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="sci-fi-input mb-4"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="sci-fi-input mb-6"
          />
        </div>
        <Button className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80" onClick={handleLogin}>
          Sign In
        </Button>
      </Card>
    </div>
  );
};

export default AdminLogin;
