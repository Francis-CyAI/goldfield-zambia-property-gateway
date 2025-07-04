
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    user: {
      name: string;
      avatar?: string;
      location?: string;
    };
    rating: number;
    date: Date;
    comment: string;
    isVerifiedStay?: boolean;
    categories?: {
      cleanliness: number;
      accuracy: number;
      checkin: number;
      communication: number;
      location: number;
      value: number;
    };
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={review.user.avatar} />
            <AvatarFallback>
              {review.user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold">{review.user.name}</h4>
                  {review.isVerifiedStay && (
                    <Badge className="bg-green-100 text-green-800 space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Verified Stay</span>
                    </Badge>
                  )}
                </div>
                {review.user.location && (
                  <p className="text-sm text-gray-600">{review.user.location}</p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  {renderStars(review.rating)}
                </div>
                <p className="text-sm text-gray-600">
                  {format(review.date, 'MMMM yyyy')}
                </p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{review.comment}</p>

            {review.categories && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                {Object.entries(review.categories).map(([category, rating]) => (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-600">
                      {category === 'checkin' ? 'Check-in' : category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
