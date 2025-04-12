import { Link } from 'react-router-dom';
import { Twitter, Github, Mail, Heart, ExternalLink, Shield, FileText, HelpCircle, MessageSquare, Sparkles } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-safebite-dark-blue border-t border-safebite-card-bg-alt py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-safebite-teal to-safebite-purple flex items-center justify-center mr-2">
                <Sparkles size={16} className="text-white" />
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple">SafeBite v2.5</h3>
            </div>
            <p className="text-safebite-text-secondary mb-4">
              Smart food safety and nutrition platform helping you make informed decisions about the food you consume.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/adityashenvi" target="_blank" rel="noopener noreferrer" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">
                <Twitter size={20} />
              </a>
              <a href="mailto:contact@safebite.example.com" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors">
                <Mail size={20} />
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
              <li>
                <Link to="/help" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors flex items-center">
                  <HelpCircle size={14} className="mr-2" />
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors flex items-center">
                  <MessageSquare size={14} className="mr-2" />
                  <span>Community</span>
                </Link>
              </li>
              <li>
                <Link to="/healthbox" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors flex items-center">
                  <Shield size={14} className="mr-2" />
                  <span>Health Tools</span>
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors flex items-center">
                  <FileText size={14} className="mr-2" />
                  <span>Recipes</span>
                </Link>
              </li>
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
          <div className="text-safebite-text-secondary text-sm">
            <p>&copy; {new Date().getFullYear()} SafeBite v2.5. All rights reserved.</p>
            <p className="mt-1 flex items-center">
              Made with <Heart size={12} className="mx-1 text-red-500" /> by
              <a href="https://github.com/adityashenvi" target="_blank" rel="noopener noreferrer" className="text-safebite-teal hover:underline flex items-center ml-1">
                Aditya Shenvi
                <ExternalLink size={10} className="ml-1" />
              </a>
            </p>
          </div>
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
