import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Navigation, Search, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, getAddressFromCoordinates } from '@/services/locationService';
import { getPincodeFromCoordinates, getPincodeData, saveUserPincode, getUserPincode, getUserPincodeData, PincodeData } from '@/services/pincodeService';

interface LocationSelectorProps {
  onLocationChange?: (pincodeData: PincodeData) => void;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationChange,
  className = ''
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeData, setPincodeData] = useState<PincodeData | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Load saved pincode on mount
  useEffect(() => {
    const savedPincode = getUserPincode();
    const savedPincodeData = getUserPincodeData();

    if (savedPincode) {
      setPincode(savedPincode);
    }

    if (savedPincodeData) {
      setPincodeData(savedPincodeData);

      if (onLocationChange) {
        onLocationChange(savedPincodeData);
      }
    }
  }, [onLocationChange]);

  // Handle getting current location
  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setPincodeError(null);

    try {
      const location = await getCurrentLocation();

      if (!location) {
        throw new Error('Failed to get current location');
      }

      // Get address from coordinates
      const addressText = await getAddressFromCoordinates(location.latitude, location.longitude);
      setAddress(addressText || 'Location found, but address details unavailable');

      try {
        // Get pincode from coordinates
        const pincodeData = await getPincodeFromCoordinates(location.latitude, location.longitude);

        if (!pincodeData) {
          // Use a default pincode for testing if we can't get one from coordinates
          const defaultPincode = '110001'; // New Delhi
          const defaultData = await getPincodeData(defaultPincode);

          if (defaultData) {
            setPincode(defaultData.pincode);
            setPincodeData(defaultData);

            // Save pincode data
            saveUserPincode(defaultData.pincode, defaultData);

            // Notify parent component
            if (onLocationChange) {
              onLocationChange(defaultData);
            }

            toast({
              title: "Using Default Location",
              description: `Using ${defaultData.city} as your location. You can change it manually.`,
            });

            setIsOpen(false);
            return;
          } else {
            throw new Error('Failed to get pincode from location');
          }
        }

        setPincode(pincodeData.pincode);
        setPincodeData(pincodeData);

        // Save pincode data
        saveUserPincode(pincodeData.pincode, pincodeData);

        // Notify parent component
        if (onLocationChange) {
          onLocationChange(pincodeData);
        }

        toast({
          title: "Location Updated",
          description: `Your location has been set to ${pincodeData.city}, ${pincodeData.state}`,
        });

        setIsOpen(false);
      } catch (pincodeError) {
        console.error('Error getting pincode:', pincodeError);
        // Set a default pincode
        setPincode('110001'); // New Delhi
        setPincodeError('Could not determine your pincode. Please enter it manually.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setPincodeError('Failed to get your current location. Please enter your pincode manually.');

      toast({
        title: "Location Error",
        description: "Failed to get your current location. Please enter your pincode manually.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pincode change
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(value);
    setPincodeError(null);
  };

  // Handle pincode submit
  const handlePincodeSubmit = async () => {
    if (pincode.length !== 6) {
      setPincodeError('Please enter a valid 6-digit pincode');
      return;
    }

    setIsLoading(true);
    setPincodeError(null);

    try {
      const data = await getPincodeData(pincode);

      if (!data) {
        // Try with a default pincode if the entered one fails
        const defaultPincodes = ['110001', '400001', '560001', '500001', '600001'];
        let foundData = null;

        // Try each default pincode until one works
        for (const defaultPincode of defaultPincodes) {
          try {
            const tempData = await getPincodeData(defaultPincode);
            if (tempData) {
              foundData = tempData;
              break;
            }
          } catch (e) {
            console.error(`Error with default pincode ${defaultPincode}:`, e);
          }
        }

        if (foundData) {
          setPincodeData(foundData);
          setPincode(foundData.pincode);

          // Save pincode data
          saveUserPincode(foundData.pincode, foundData);

          // Notify parent component
          if (onLocationChange) {
            onLocationChange(foundData);
          }

          toast({
            title: "Using Default Location",
            description: `Using ${foundData.city} as your location. The pincode you entered was not found.`,
          });

          setIsOpen(false);
          return;
        } else {
          throw new Error('Invalid pincode and all fallbacks failed');
        }
      }

      setPincodeData(data);

      // Save pincode data
      saveUserPincode(pincode, data);

      // Notify parent component
      if (onLocationChange) {
        onLocationChange(data);
      }

      toast({
        title: "Location Updated",
        description: `Your location has been set to ${data.city}, ${data.state}`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error validating pincode:', error);
      setPincodeError('Invalid pincode. Please enter a valid 6-digit pincode.');

      // Set a default pincode as fallback
      try {
        const defaultPincode = '110001'; // New Delhi
        const defaultData = await getPincodeData(defaultPincode);

        if (defaultData) {
          setPincode(defaultData.pincode);
          setPincodeData(defaultData);

          // Save pincode data
          saveUserPincode(defaultData.pincode, defaultData);

          // Notify parent component
          if (onLocationChange) {
            onLocationChange(defaultData);
          }

          toast({
            title: "Using Default Location",
            description: `Using ${defaultData.city} as your location. You can change it manually.`,
          });

          setIsOpen(false);
        }
      } catch (fallbackError) {
        console.error('Error with fallback pincode:', fallbackError);
        toast({
          title: "Pincode Error",
          description: "Invalid pincode. Please enter a valid 6-digit pincode.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-1 ${className}`}
            onClick={() => setIsPopoverOpen(true)}
          >
            <MapPin className="h-4 w-4 text-safebite-teal" />
            {pincodeData ? (
              <span className="text-xs truncate max-w-[100px]">
                {pincodeData.city}, {pincodeData.pincode}
              </span>
            ) : (
              <span className="text-xs">Set Location</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-safebite-teal flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-safebite-text">Your Delivery Location</h4>
                {pincodeData ? (
                  <p className="text-sm text-safebite-text-secondary">
                    {pincodeData.city}, {pincodeData.state}, {pincodeData.pincode}
                  </p>
                ) : (
                  <p className="text-sm text-safebite-text-secondary">
                    No location set. Please set your delivery location.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                onClick={() => {
                  setIsPopoverOpen(false);
                  setIsOpen(true);
                }}
              >
                Change
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsPopoverOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Location</DialogTitle>
            <DialogDescription>
              Enter your pincode or use your current location to check product availability.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <div className="flex gap-2">
                <Input
                  id="pincode"
                  placeholder="Enter 6-digit pincode"
                  value={pincode}
                  onChange={handlePincodeChange}
                  className="flex-1"
                  maxLength={6}
                />
                <Button
                  onClick={handlePincodeSubmit}
                  disabled={isLoading || pincode.length !== 6}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {pincodeError && (
                <p className="text-red-500 text-xs">{pincodeError}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-safebite-card-bg-alt" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-safebite-card-bg px-2 text-safebite-text-secondary">
                  OR
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Use Current Location
            </Button>

            {address && (
              <div className="p-3 bg-safebite-card-bg-alt/30 rounded-md">
                <p className="text-xs text-safebite-text-secondary">
                  <MapPin className="h-3 w-3 inline-block mr-1" />
                  {address}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handlePincodeSubmit}
              disabled={isLoading || pincode.length !== 6}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationSelector;
