import React from 'react';
import { Trophy, Award, Star, Medal, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: 'trophy' | 'award' | 'star' | 'medal' | 'zap';
  date?: Date;
  completed?: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showXP?: boolean;
  className?: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showXP = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48
  };

  const renderIcon = () => {
    const iconSize = iconSizes[size];
    
    switch (achievement.icon) {
      case 'trophy':
        return <Trophy size={iconSize} className="text-yellow-400" />;
      case 'award':
        return <Award size={iconSize} className="text-blue-400" />;
      case 'star':
        return <Star size={iconSize} className="text-purple-400" />;
      case 'medal':
        return <Medal size={iconSize} className="text-green-400" />;
      case 'zap':
        return <Zap size={iconSize} className="text-safebite-teal" />;
      default:
        return <Trophy size={iconSize} className="text-yellow-400" />;
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Background glow */}
        <div className="absolute inset-0 rounded-full bg-safebite-teal/20 blur-md"></div>
        
        {/* Badge circle */}
        <div className="absolute inset-0 rounded-full border-2 border-safebite-teal flex items-center justify-center bg-safebite-card-bg">
          {/* Icon */}
          {renderIcon()}
        </div>
        
        {/* XP indicator */}
        {showXP && (
          <div className="absolute -bottom-2 -right-2 bg-safebite-teal text-safebite-dark-blue text-xs font-bold rounded-full px-2 py-1 border border-safebite-dark-blue">
            +{achievement.xp} XP
          </div>
        )}
      </div>
      
      <h3 className="mt-2 text-safebite-text font-medium text-center">{achievement.title}</h3>
      
      {achievement.completed ? (
        <Badge variant="outline" className="mt-1 bg-safebite-teal/20 text-safebite-teal border-safebite-teal/50">
          Completed
        </Badge>
      ) : (
        <Badge variant="outline" className="mt-1 bg-safebite-card-bg-alt text-safebite-text-secondary">
          In Progress
        </Badge>
      )}
    </div>
  );
};

export default AchievementBadge;
