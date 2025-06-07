
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';
import { format, isSameDay, isAfter, isBefore } from 'date-fns';

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect?: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
}

const AvailabilityCalendar = ({ propertyId, onDateSelect }: AvailabilityCalendarProps) => {
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);

  // Mock availability data - in real app, fetch from backend
  const unavailableDates = [
    new Date('2024-07-10'),
    new Date('2024-07-11'),
    new Date('2024-07-15'),
    new Date('2024-07-16'),
    new Date('2024-07-17'),
    new Date('2024-08-05'),
    new Date('2024-08-06'),
    new Date('2024-08-07'),
  ];

  const priceVariations = {
    '2024-07-20': 520, // Weekend rate
    '2024-07-21': 520,
    '2024-08-15': 600, // Peak season
    '2024-08-16': 600,
  };

  const defaultPrice = 450;

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      isSameDay(date, unavailableDate)
    );
  };

  const getDatePrice = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return priceVariations[dateKey as keyof typeof priceVariations] || defaultPrice;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!checkIn || (checkIn && isSelectingCheckOut)) {
      if (!checkIn) {
        setCheckIn(date);
        setIsSelectingCheckOut(true);
      } else {
        if (isAfter(date, checkIn)) {
          setCheckOut(date);
          setIsSelectingCheckOut(false);
          onDateSelect?.(checkIn, date);
        } else {
          // Reset if selected date is before check-in
          setCheckIn(date);
          setCheckOut(undefined);
          setIsSelectingCheckOut(true);
        }
      }
    } else {
      // Reset selection
      setCheckIn(date);
      setCheckOut(undefined);
      setIsSelectingCheckOut(true);
    }
  };

  const clearDates = () => {
    setCheckIn(undefined);
    setCheckOut(undefined);
    setIsSelectingCheckOut(false);
    onDateSelect?.(undefined, undefined);
  };

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    return isAfter(date, checkIn) && isBefore(date, checkOut);
  };

  const isDateSelected = (date: Date) => {
    return (checkIn && isSameDay(date, checkIn)) || 
           (checkOut && isSameDay(date, checkOut));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarDays className="h-5 w-5" />
          <span>Select dates</span>
        </CardTitle>
        {(checkIn || checkOut) && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {checkIn && (
                <span>Check-in: {format(checkIn, 'MMM dd, yyyy')}</span>
              )}
              {checkOut && (
                <span className="ml-4">Check-out: {format(checkOut, 'MMM dd, yyyy')}</span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={clearDates}>
              Clear
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={checkIn}
          onSelect={handleDateSelect}
          disabled={(date) => {
            if (date < new Date()) return true;
            if (isDateUnavailable(date)) return true;
            return false;
          }}
          modifiers={{
            unavailable: unavailableDates,
            inRange: (date) => isDateInRange(date),
            selected: (date) => isDateSelected(date),
          }}
          modifiersStyles={{
            unavailable: { 
              backgroundColor: '#fee2e2', 
              color: '#dc2626',
              textDecoration: 'line-through'
            },
            inRange: { 
              backgroundColor: '#dbeafe', 
              color: '#1d4ed8' 
            },
            selected: { 
              backgroundColor: '#3b82f6', 
              color: 'white' 
            },
          }}
          className="rounded-md border"
        />
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Base rate: K{defaultPrice}/night</span>
            <Badge variant="outline" className="text-xs">
              Prices may vary by date
            </Badge>
          </div>
          
          {checkIn && checkOut && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected period:</span>
                <span className="text-sm">
                  {format(checkIn, 'MMM dd')} - {format(checkOut, 'MMM dd')}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
