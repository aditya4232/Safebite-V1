import React from 'react';
import { Check, Database, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ApiSource {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface ApiSourceSelectorProps {
  apiSources: ApiSource[];
  onToggleApi: (apiId: string) => void;
  onClose: () => void;
}

const ApiSourceSelector: React.FC<ApiSourceSelectorProps> = ({
  apiSources,
  onToggleApi,
  onClose
}) => {
  const activeCount = apiSources.filter(api => api.isActive).length;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-safebite-card-bg rounded-lg max-w-md w-full border border-safebite-card-bg-alt overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-safebite-card-bg-alt">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-safebite-teal mr-2" />
            <h3 className="text-xl font-semibold text-safebite-text">
              API Sources
            </h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-safebite-text-secondary hover:text-safebite-text"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4">
          <p className="text-safebite-text-secondary mb-4">
            Select which nutrition databases to search. Using multiple sources provides more comprehensive results.
          </p>
          
          <div className="space-y-3 mb-4">
            {apiSources.map((api) => (
              <div 
                key={api.id}
                className="flex items-center justify-between p-3 bg-safebite-card-bg-alt/50 rounded-lg cursor-pointer hover:bg-safebite-card-bg-alt transition-colors"
                onClick={() => onToggleApi(api.id)}
              >
                <div className="flex-grow">
                  <div className="flex items-center">
                    <span className="text-safebite-text font-medium">{api.name}</span>
                    {api.isActive && (
                      <Badge className="ml-2 bg-safebite-teal text-safebite-dark-blue">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-safebite-text-secondary mt-1">
                    {api.description}
                  </p>
                </div>
                
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                  api.isActive 
                    ? 'border-safebite-teal bg-safebite-teal/20' 
                    : 'border-safebite-text-secondary'
                }`}>
                  {api.isActive && <Check className="h-4 w-4 text-safebite-teal" />}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-safebite-card-bg-alt/30 p-3 rounded-lg text-center">
            <p className="text-safebite-text-secondary text-sm">
              {activeCount === 0 
                ? "No API sources selected. At least one is required." 
                : `${activeCount} API source${activeCount > 1 ? 's' : ''} selected`}
            </p>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              onClick={onClose}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSourceSelector;
