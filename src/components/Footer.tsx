import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Github } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-safebite-dark-blue border-t border-safebite-card-bg-alt py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">SafeBite</h3>
            <p className="text-safebite-text-secondary mb-4">
              Your personal food safety and nutrition companion. Make informed choices for a healthier you.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-safebite-text mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">About Us</Link></li>
              <li><Link to="/team" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Our Team</Link></li>
              <li><Link to="/careers" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-safebite-text mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Blog</Link></li>
              <li><Link to="/guides" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Nutrition Guides</Link></li>
              <li><Link to="/faq" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">FAQs</Link></li>
              <li><Link to="/community" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Community</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-safebite-text mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Cookie Policy</Link></li>
              <li><Link to="/data" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Data Protection</Link></li>
              <li><Link to="/admin/login" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-safebite-card-bg-alt" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-safebite-text-secondary text-sm">
            &copy; {new Date().getFullYear()} SafeBite. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li><Link to="/privacy" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors text-sm">Privacy</Link></li>
              <li><Link to="/terms" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors text-sm">Terms</Link></li>
              <li><Link to="/cookies" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors text-sm">Cookies</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
