
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface Question {
  id: string;
  type: 'radio' | 'text' | 'slider';
  question: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

interface QuestionnaireStepProps {
  question: Question;
  value: any;
  onChange: (id: string, value: any) => void;
  onNext: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isLoading?: boolean; // Add isLoading prop
}

const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
  question,
  value,
  onChange,
  onNext,
  onBack,
  isFirst = false,
  isLast = false,
  isLoading = false, // Default isLoading to false
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(question.id, newValue);
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup value={localValue} onValueChange={handleChange}>
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option} 
                    id={`${question.id}-${option}`} 
                    className="border-safebite-text-secondary text-safebite-teal"
                  />
                  <Label 
                    htmlFor={`${question.id}-${option}`}
                    className="text-safebite-text"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
      case 'text':
        return (
          <Input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="sci-fi-input mt-2"
          />
        );
      case 'slider':
        return (
          <div className="space-y-4 mt-6">
            <Slider
              value={[localValue]}
              min={question.min || 0}
              max={question.max || 100}
              step={question.step || 1}
              onValueChange={(values) => handleChange(values[0])}
              className="mt-2"
            />
            <div className="flex justify-between text-safebite-text-secondary text-sm">
              <span>{question.min}</span>
              <span className="text-safebite-teal font-medium">Current: {localValue}</span>
              <span>{question.max}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sci-fi-card">
      <h3 className="text-xl font-semibold mb-4 text-safebite-text">{question.question}</h3>
      {renderQuestionInput()}
      <div className="flex justify-between mt-8">
        {!isFirst ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="sci-fi-button"
          >
            Back
          </Button>
        ) : (
          <div></div>
        )}
        <Button 
          type="button" 
          onClick={onNext}
          className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? (isLast ? 'Submitting...' : 'Loading...') : (isLast ? 'Submit' : 'Next')}
        </Button>
      </div>
    </div>
  );
};

export default QuestionnaireStep;
