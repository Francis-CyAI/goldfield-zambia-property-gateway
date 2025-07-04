
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, MessageCircle, Reply } from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedReviewCardProps {
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
    hostResponse?: {
      message: string;
      date: Date;
      hostName: string;
    };
  };
  isHost?: boolean;
  onHostResponse?: (reviewId: string, response: string) => void;
}

const EnhancedReviewCard = ({ review, isHost = false, onHostResponse }: EnhancedReviewCardProps) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderStars = (rating: number, size = 'h-4 w-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !onHostResponse) return;
    
    setIsSubmitting(true);
    try {
      await onHostResponse(review.id, responseText.trim());
      setResponseText('');
      setShowResponseForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Review Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={review.user.avatar} />
                <AvatarFallback>
                  {review.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
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
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                {renderStars(review.rating)}
                <span className="font-medium ml-1">{review.rating}</span>
              </div>
              <p className="text-sm text-gray-600">
                {format(review.date, 'MMMM yyyy')}
              </p>
            </div>
          </div>

          {/* Review Content */}
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>

          {/* Category Ratings */}
          {review.categories && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
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

          {/* Host Response */}
          {review.hostResponse && (
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
              <div className="flex items-center space-x-2 mb-2">
                <Reply className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Response from {review.hostResponse.hostName}</span>
                <span className="text-xs text-gray-500">
                  {format(review.hostResponse.date, 'MMM dd, yyyy')}
                </span>
              </div>
              <p className="text-sm text-gray-700">{review.hostResponse.message}</p>
            </div>
          )}

          {/* Host Response Actions */}
          {isHost && !review.hostResponse && (
            <div className="pt-2 border-t border-gray-100">
              {!showResponseForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResponseForm(true)}
                  className="space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Respond to Review</span>
                </Button>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write a thoughtful response to this review..."
                    className="min-h-[80px]"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {responseText.length}/500 characters
                    </span>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowResponseForm(false);
                          setResponseText('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmitResponse}
                        disabled={!responseText.trim() || isSubmitting}
                      >
                        {isSubmitting ? 'Posting...' : 'Post Response'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedReviewCard;
