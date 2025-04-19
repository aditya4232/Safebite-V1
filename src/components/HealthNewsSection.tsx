import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
}

const HealthNewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll use mock data
      const mockNews: NewsItem[] = [
        {
          title: "New Study Links Mediterranean Diet to Longer Lifespan",
          description: "Researchers found that people who closely follow a Mediterranean diet have a 25% lower risk of mortality.",
          url: "https://www.healthline.com/nutrition/mediterranean-diet-benefits",
          source: "Healthline",
          category: "Nutrition",
          publishedAt: new Date().toISOString()
        },
        {
          title: "Exercise in Morning May Offer Most Weight Loss Benefits",
          description: "A new study suggests that morning exercise might be more effective for weight management than working out later in the day.",
          url: "https://www.webmd.com/fitness-exercise/news/20230405/morning-exercise-may-offer-the-most-weight-loss-benefits",
          source: "WebMD",
          category: "Fitness",
          publishedAt: new Date().toISOString()
        },
        {
          title: "Eating More Protein May Help Seniors Maintain Muscle Mass",
          description: "Research indicates that higher protein intake can help older adults preserve muscle mass and strength as they age.",
          url: "https://www.nih.gov/news-events/nih-research-matters/protein-intake-linked-muscle-health-older-adults",
          source: "NIH",
          category: "Nutrition",
          publishedAt: new Date().toISOString()
        }
      ];
      
      setNews(mockNews);
      setLastUpdated(new Date());
      
      toast({
        title: "News Updated",
        description: "Latest health news has been loaded.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error fetching health news:', error);
      toast({
        title: "Failed to Load News",
        description: "Could not retrieve the latest health news. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch news on component mount
  useEffect(() => {
    fetchNews();
    
    // Set up auto-refresh every 30 minutes
    const refreshInterval = setInterval(() => {
      fetchNews();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <Card className="sci-fi-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
          <Newspaper className="h-5 w-5 mr-2 text-safebite-teal" />
          Health & Nutrition News
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchNews}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="border-b border-safebite-card-bg-alt pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-safebite-text">{item.title}</h3>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm text-safebite-text-secondary mt-1 mb-2">{item.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-safebite-text-secondary">Source: {item.source}</span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-safebite-teal hover:text-safebite-teal/80"
                  >
                    Read More <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-safebite-text-secondary">No health news available at the moment.</p>
          </div>
        )}
        
        {lastUpdated && (
          <div className="text-xs text-safebite-text-secondary mt-4 text-right">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthNewsSection;
