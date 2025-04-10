import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Moon, Sunrise, Sunset } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trackHealthBoxInteraction } from '@/services/mlService';
import userActivityService from '@/services/userActivityService';

const SleepCalculator = () => {
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('');
  const [age, setAge] = useState<string>('adult');
  const [results, setResults] = useState<{
    bedtime: string;
    cycles: number;
    duration: string;
    quality: string;
  } | null>(null);

  // Sleep cycle duration in minutes by age group
  const cycleDurations: Record<string, number> = {
    infant: 50,
    toddler: 60,
    child: 70,
    teen: 90,
    adult: 90,
    senior: 85
  };

  // Recommended sleep duration in hours by age group
  const recommendedSleep: Record<string, { min: number; max: number }> = {
    infant: { min: 12, max: 16 },
    toddler: { min: 11, max: 14 },
    child: { min: 9, max: 12 },
    teen: { min: 8, max: 10 },
    adult: { min: 7, max: 9 },
    senior: { min: 7, max: 8 }
  };

  const calculateBedtime = () => {
    try {
      if (!wakeUpTime) return;

      const [hours, minutes] = wakeUpTime.split(':').map(Number);
      const wakeUpDate = new Date();
      wakeUpDate.setHours(hours, minutes, 0, 0);

      // Calculate ideal bedtime based on sleep cycles
      const cycleDuration = cycleDurations[age]; // in minutes
      const recommendedCycles = 5; // 5-6 sleep cycles is ideal

      // Calculate bedtime
      const bedtimeDate = new Date(wakeUpDate);
      bedtimeDate.setMinutes(bedtimeDate.getMinutes() - (cycleDuration * recommendedCycles));

      // Format bedtime
      const bedtimeHours = bedtimeDate.getHours().toString().padStart(2, '0');
      const bedtimeMinutes = bedtimeDate.getMinutes().toString().padStart(2, '0');
      const bedtime = `${bedtimeHours}:${bedtimeMinutes}`;

      // Calculate sleep duration if sleep time is provided
      let duration = '';
      let cycles = recommendedCycles;
      let quality = '';

      if (sleepTime) {
        const [sleepHours, sleepMinutes] = sleepTime.split(':').map(Number);
        const sleepDate = new Date();
        sleepDate.setHours(sleepHours, sleepMinutes, 0, 0);

        // Handle overnight sleep
        let sleepDuration = wakeUpDate.getTime() - sleepDate.getTime();
        if (sleepDuration < 0) {
          sleepDuration += 24 * 60 * 60 * 1000; // Add 24 hours
        }

        // Convert to hours and minutes
        const durationHours = Math.floor(sleepDuration / (60 * 60 * 1000));
        const durationMinutes = Math.floor((sleepDuration % (60 * 60 * 1000)) / (60 * 1000));
        duration = `${durationHours}h ${durationMinutes}m`;

        // Calculate actual cycles
        cycles = Math.round(sleepDuration / (cycleDuration * 60 * 1000));

        // Determine sleep quality based on recommended duration
        const durationInHours = durationHours + (durationMinutes / 60);
        const { min, max } = recommendedSleep[age];

        if (durationInHours < min) {
          quality = 'Insufficient';
        } else if (durationInHours > max) {
          quality = 'Excessive';
        } else {
          quality = 'Optimal';
        }
      }

      const result = {
        bedtime,
        cycles: cycles,
        duration,
        quality
      };

      setResults(result);

      // Track this interaction for ML learning
      trackHealthBoxInteraction('sleep', 'calculate');
      userActivityService.trackActivity('health-tool', 'sleep-calculate', {
        age,
        wakeUpTime,
        sleepTime: sleepTime || 'not provided',
        result: {
          bedtime,
          cycles,
          quality: quality || 'not calculated'
        }
      });
    } catch (error) {
      console.error('Error calculating sleep time:', error);
      // Provide a fallback result in case of error
      setResults({
        bedtime: '22:30',
        cycles: 5,
        duration: '',
        quality: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="age-group" className="text-safebite-text">Age Group</Label>
          <Select value={age} onValueChange={setAge}>
            <SelectTrigger className="bg-safebite-card-bg-alt border-safebite-card-bg-alt">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="infant">Infant (0-1 years)</SelectItem>
              <SelectItem value="toddler">Toddler (1-3 years)</SelectItem>
              <SelectItem value="child">Child (3-12 years)</SelectItem>
              <SelectItem value="teen">Teen (13-17 years)</SelectItem>
              <SelectItem value="adult">Adult (18-64 years)</SelectItem>
              <SelectItem value="senior">Senior (65+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="wake-up-time" className="text-safebite-text">
            <Sunrise className="inline-block mr-2 h-4 w-4" />
            Wake-up Time
          </Label>
          <Input
            id="wake-up-time"
            type="time"
            value={wakeUpTime}
            onChange={(e) => setWakeUpTime(e.target.value)}
            className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
          />
        </div>

        <div>
          <Label htmlFor="sleep-time" className="text-safebite-text">
            <Sunset className="inline-block mr-2 h-4 w-4" />
            Sleep Time (optional)
          </Label>
          <Input
            id="sleep-time"
            type="time"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
            className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
            placeholder="Optional"
          />
        </div>
      </div>

      <Button
        onClick={calculateBedtime}
        className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
      >
        <Moon className="mr-2 h-4 w-4" />
        Calculate Optimal Sleep
      </Button>

      {results && (
        <Card className="mt-4 border-t-4 border-t-safebite-teal">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <div className="flex items-center mb-1">
                  <Moon className="h-4 w-4 text-safebite-teal mr-2" />
                  <span className="font-semibold text-safebite-text">Recommended Bedtime</span>
                </div>
                <p className="text-xl font-bold text-safebite-teal">{results.bedtime}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-sm text-safebite-text-secondary">Sleep Cycles</div>
                  <div className="font-semibold text-safebite-text">{results.cycles} cycles</div>
                </div>

                {results.duration && (
                  <div>
                    <div className="text-sm text-safebite-text-secondary">Sleep Duration</div>
                    <div className="font-semibold text-safebite-text">{results.duration}</div>
                  </div>
                )}

                {results.quality && (
                  <div className="col-span-2">
                    <div className="text-sm text-safebite-text-secondary">Sleep Quality</div>
                    <div className={`font-semibold ${
                      results.quality === 'Optimal' ? 'text-green-500' :
                      results.quality === 'Insufficient' ? 'text-red-500' : 'text-yellow-500'
                    }`}>{results.quality}</div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-safebite-text-secondary">
                <p>Recommended sleep for {age === 'adult' ? 'adults' : age === 'senior' ? 'seniors' : age + 's'}: {recommendedSleep[age].min}-{recommendedSleep[age].max} hours</p>
                <p className="mt-1">Note: This calculator provides general guidance based on average sleep cycles.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SleepCalculator;
