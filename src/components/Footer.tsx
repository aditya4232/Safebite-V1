import { Link } from 'react-router-dom';
import { Twitter, Github, Mail, Heart, ExternalLink, Shield, FileText, HelpCircle, MessageSquare, Sparkles } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-safebite-dark-blue border-t border-safebite-card-bg-alt py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center py-2">
          <div className="flex items-center mb-2 md:mb-0">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-safebite-teal to-safebite-purple flex items-center justify-center mr-2">
              <Sparkles size={12} className="text-white" />
            </div>
            <h3 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple">SafeBite v3.0</h3>
          </div>

          <div className="flex space-x-4 mb-2 md:mb-0">
            <a href="https://github.com/adityashenvi" target="_blank" rel="noopener noreferrer" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors" title="GitHub">
              <Github size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors" title="Twitter">
              <Twitter size={16} />
            </a>
            <a href="mailto:contact@safebite.example.com" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors" title="Email">
              <Mail size={16} />
            </a>
            <Link to="/help" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors" title="Help">
              <HelpCircle size={16} />
            </Link>
            <Link to="/chat" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors" title="Chat with AI">
              <MessageSquare size={16} />
            </Link>
          </div>

          <div className="text-safebite-text-secondary text-xs flex items-center flex-wrap justify-center">
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="mx-1">•</span>
            <span className="flex items-center">
              Made by
              <a href="https://github.com/adityashenvi" target="_blank" rel="noopener noreferrer" className="text-safebite-teal hover:underline flex items-center mx-1">
                Aditya Shenvi
                <ExternalLink size={8} className="ml-0.5" />
              </a>
            </span>
            <span className="mx-1">•</span>
            <Link to="/privacy" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors text-xs">Privacy</Link>
            <span className="mx-1">•</span>
            <Link to="/terms" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors text-xs">Terms</Link>
            <span className="mx-1">•</span>
            <Link to="/changelog" className="text-safebite-text-secondary hover:text-safebite-teal transition-colors text-xs">Changelog</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
