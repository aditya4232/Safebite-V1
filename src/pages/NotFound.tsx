
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-safebite-dark-blue px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <div className="mb-8 inline-block p-4 rounded-lg bg-safebite-card-bg border border-safebite-card-bg-alt">
          <p className="text-xl text-safebite-text mb-4">Page not found</p>
          <p className="text-safebite-text-secondary mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button 
          className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          asChild
        >
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
