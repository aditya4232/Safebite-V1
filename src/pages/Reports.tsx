
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart, PieChart, TrendingUp } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useGuestMode } from '@/hooks/useGuestMode';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const { isGuest } = useGuestMode();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleReportGeneration = (reportType: string) => {
    if (isGuest) {
      toast({
        title: "Feature limited in guest mode",
        description: "Please sign up for a full account to generate reports.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Report Generated",
        description: `Your ${reportType} report is ready for download.`
      });
    }, 2000);
  };

  const reports = [
    {
      title: "Weekly Health Summary",
      description: "Overview of your calories, nutrients, and activity for the past week",
      icon: <BarChart size={24} className="text-safebite-teal" />,
      type: "weekly-health"
    },
    {
      title: "Nutrition Analysis",
      description: "Detailed breakdown of your macro and micronutrient intake",
      icon: <PieChart size={24} className="text-safebite-purple" />,
      type: "nutrition"
    },
    {
      title: "Food Safety Report",
      description: "Analysis of food additive consumption and safety ratings",
      icon: <FileText size={24} className="text-blue-400" />,
      type: "food-safety"
    },
    {
      title: "Progress Trends",
      description: "Track your health metrics over time with detailed charts",
      icon: <TrendingUp size={24} className="text-green-400" />,
      type: "trends"
    }
  ];

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
        Under Development
      </div>
      
      <DashboardSidebar />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Reports & Analytics</h1>
            <p className="text-safebite-text-secondary">
              Generate detailed health and nutrition reports based on your data
            </p>
          </div>
          
          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {reports.map((report) => (
              <Card key={report.type} className="sci-fi-card">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 rounded-full bg-safebite-card-bg-alt flex items-center justify-center">
                      {report.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-safebite-text mb-2">{report.title}</h3>
                    <p className="text-safebite-text-secondary mb-4">{report.description}</p>
                    <Button 
                      variant="outline" 
                      className="sci-fi-button"
                      onClick={() => handleReportGeneration(report.title)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Report'}
                      <Download className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Guest Mode Notice */}
          {isGuest && (
            <Card className="sci-fi-card border-safebite-purple mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-safebite-text">
                  Limited Functionality in Guest Mode
                </h3>
                <p className="text-safebite-text-secondary mb-4">
                  Create an account to generate and download personalized reports based on your data.
                </p>
                <Button 
                  className="bg-safebite-purple text-white hover:bg-safebite-purple/80"
                  onClick={() => {}}
                >
                  Sign Up Now
                </Button>
              </div>
            </Card>
          )}
          
          <div className="text-xs text-safebite-text-secondary mt-6 text-right">
            Created by Aditya Shenvi
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
