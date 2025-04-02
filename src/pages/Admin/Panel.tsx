import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { app } from "../../main";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, [db]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/auth/login');
    }).catch((error) => {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    });
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="sci-fi-card max-w-4xl w-full p-6">
          <h2 className="text-2xl font-bold gradient-text text-center mb-4">Admin Panel</h2>
          <p className="text-safebite-text-secondary text-center mb-6">
            Welcome, Admin1! Here you can manage users and their data.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-safebite-text">User ID</th>
                  <th className="py-2 px-4 border-b text-safebite-text">Email</th>
                  <th className="py-2 px-4 border-b text-safebite-text">Profile Data</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="py-2 px-4 border-b text-safebite-text">{user.id}</td>
                    <td className="py-2 px-4 border-b text-safebite-text">{user.email}</td>
                    <td className="py-2 px-4 border-b text-safebite-text">{JSON.stringify(user.profile)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button className="mt-6 w-full bg-red-500 text-white hover:bg-red-600" onClick={handleLogout}>
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
