import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import ProfileImage from '@/components/ProfileImage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">About SafeBite</span>
          </h1>
          <p className="text-safebite-text-secondary text-lg max-w-3xl mx-auto">
            A special project focused on helping people make informed food choices for better health
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-semibold text-safebite-text mb-4">Our Mission</h2>
            <p className="text-safebite-text-secondary mb-6">
              SafeBite was created with a simple mission: to help people understand what's in their food and make healthier choices. In a world where processed foods dominate and nutrition labels can be confusing, we wanted to build a tool that makes food transparency accessible to everyone.
            </p>
            <p className="text-safebite-text-secondary mb-6">
              Our platform combines food data from multiple sources, personalized recommendations based on your health profile, and an intuitive interface to make healthy eating easier than ever.
            </p>
            <p className="text-safebite-text-secondary">
              This project is part of a special engineering project at IFHE Hyderabad, focused on applying technology to solve real-world health challenges.
            </p>
          </div>

          <div className="bg-safebite-card-bg rounded-lg p-6 border border-safebite-card-bg-alt">
            <h2 className="text-2xl font-semibold text-safebite-text mb-4">Project Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-safebite-text">Developer</h3>
                <p className="text-safebite-text-secondary">Aditya Shenvi</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-safebite-text">Institution</h3>
                <p className="text-safebite-text-secondary">IFHE Hyderabad</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-safebite-text">Project Type</h3>
                <p className="text-safebite-text-secondary">Special Engineering Project</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-safebite-text">Technologies Used</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-safebite-card-bg-alt rounded-full text-xs text-safebite-text-secondary">React</span>
                  <span className="px-3 py-1 bg-safebite-card-bg-alt rounded-full text-xs text-safebite-text-secondary">TypeScript</span>
                  <span className="px-3 py-1 bg-safebite-card-bg-alt rounded-full text-xs text-safebite-text-secondary">Firebase</span>
                  <span className="px-3 py-1 bg-safebite-card-bg-alt rounded-full text-xs text-safebite-text-secondary">Tailwind CSS</span>
                  <span className="px-3 py-1 bg-safebite-card-bg-alt rounded-full text-xs text-safebite-text-secondary">Food APIs</span>
                  <span className="px-3 py-1 bg-safebite-card-bg-alt rounded-full text-xs text-safebite-text-secondary">Recharts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-safebite-text mb-6 text-center">Meet the Developer</h2>
          <Card className="sci-fi-card max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-center p-6">
              <ProfileImage size="xl" className="mb-4 md:mb-0 md:mr-6" />
              <div>
                <h3 className="text-xl font-semibold text-safebite-text mb-1">Aditya Shenvi</h3>
                <p className="text-safebite-teal text-sm mb-3">🚀 Developer | Tech Enthusiast</p>
                <p className="text-safebite-text-secondary mb-3">
                  Engineering Student at IFHE Hyderabad with a passion for creating technology that improves people's lives. SafeBite represents the intersection of my interests in health, nutrition, and software development.
                </p>
                <p className="text-safebite-text-secondary mb-4">
                  <span className="text-safebite-teal">🔹 Passionate about:</span> Frontend, Backend, DevOps, UI/UX, Cybersecurity, Open Source, Digital Marketing
                </p>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="sci-fi-button">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" size="sm" className="sci-fi-button">
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" className="sci-fi-button">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-safebite-card-bg-alt rounded-md">
                  <h4 className="text-safebite-teal font-medium mb-2">About This Project</h4>
                  <p className="text-safebite-text-secondary text-sm">
                    SafeBite is a special engineering project developed as part of my coursework at IFHE Hyderabad.
                    It combines my interest in health technology with modern web development practices to create
                    a platform that helps users make informed food choices.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-safebite-text mb-4">Data Sources & Acknowledgements</h2>
          <p className="text-safebite-text-secondary max-w-3xl mx-auto mb-6">
            SafeBite uses publicly available data from multiple food databases and APIs. All data is used for educational purposes only under fair use principles.
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <a href="https://www.edamam.com/" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-safebite-card-bg rounded-md border border-safebite-card-bg-alt hover:bg-safebite-card-bg-alt transition-colors">
              Edamam API
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
            <a href="https://www.calorieninjas.com/" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-safebite-card-bg rounded-md border border-safebite-card-bg-alt hover:bg-safebite-card-bg-alt transition-colors">
              CalorieNinjas API
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
            <a href="https://platform.fatsecret.com/" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-safebite-card-bg rounded-md border border-safebite-card-bg-alt hover:bg-safebite-card-bg-alt transition-colors">
              FatSecret API
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
            <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-safebite-card-bg rounded-md border border-safebite-card-bg-alt hover:bg-safebite-card-bg-alt transition-colors">
              Open Food Facts
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="text-center">
          <Link to="/features">
            <Button className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80">
              Explore SafeBite Features
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
