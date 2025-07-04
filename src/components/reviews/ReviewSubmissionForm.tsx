
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, AlertTriangle } from 'lucide-react';
import { useCreateReview } from '@/hooks/useReviews';
import { useToast } from '@/hooks/use-toast';

interface ReviewSubmissionFormProps {
  propertyId: string;
  bookingId?: string;
  isVerifiedStay?: boolean;
  onSuccess?: () => void;
}

const ReviewSubmissionForm = ({ 
  propertyId, 
  bookingId, 
  isVerifiedStay = false,
  onSuccess 
}: ReviewSubmissionFormProps) => {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    cleanliness: 0,
    accuracy: 0,
    checkin: 0,
    communication: 0,
    location: 0,
    value: 0
  });
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredCategoryStar, setHoveredCategoryStar] = useState(0);

  const createReview = useCreateReview();
  const { toast } = useToast();

  const categories = [
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'checkin', label: 'Check-in' },
    { key: 'communication', label: 'Communication' },
    { key: 'location', label: 'Location' },
    { key: 'value', label: 'Value' }
  ];

  const renderStars = (rating: number, onRate: (rating: number) => void, hovered = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onRate(i + 1)}
        onMouseEnter={() => setHoveredStar(i + 1)}
        onMouseLeave={() => setHoveredStar(0)}
        className="focus:outline-none"
      >
        <Star
          className={`h-6 w-6 ${
            i < (hovered || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors`}
        />
      </button>
    ));
  };

  const renderCategoryStars = (category: string, rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setCategoryRatings(prev => ({ ...prev, [category]: i + 1 }))}
        onMouseEnter={() => {
          setHoveredCategory(category);
          setHoveredCategoryStar(i + 1);
        }}
        onMouseLeave={() => {
          setHoveredCategory(null);
          setHoveredCategoryStar(0);
        }}
        className="focus:outline-none"
      >
        <Star
          className={`h-4 w-4 ${
            i < (hoveredCategory === category ? hoveredCategoryStar : rating) 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } hover:text-yellow-400 transition-colors`}
        />
      </button>
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please provide an overall rating',
        variant: 'destructive',
      });
      return;
    }

    const reviewData = {
      property_id: propertyId,
      booking_id: bookingId,
      rating: overallRating,
      comment: comment.trim() || undefined,
      category_ratings: categoryRatings,
      is_verified_stay: isVerifiedStay
    };

    try {
      await createReview.mutateAsync(reviewData);
      
      // Reset form
      setOverallRating(0);
      setCategoryRatings({
        cleanliness: 0,
        accuracy: 0,
        checkin: 0,
        communication: 0,
        location: 0,
        value: 0
      });
      setComment('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Leave a Review</CardTitle>
          {isVerifiedStay && (
            <Badge className="bg-green-100 text-green-800 space-x-1">
              <Shield className="h-3 w-3" />
              <span>Verified Stay</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-1">
              {renderStars(overallRating, setOverallRating, hoveredStar)}
            </div>
          </div>

          {/* Category Ratings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Rate by Category
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <div className="flex items-center space-x-1">
                    {renderCategoryStars(key, categoryRatings[key as keyof typeof categoryRatings])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell future guests about your stay..."
              className="min-h-[120px]"
              maxLength={1000}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {comment.length}/1000 characters
            </div>
          </div>

          {/* Safety Guidelines Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Review Guidelines</p>
                <ul className="space-y-1 text-xs">
                  <li>• Be honest and respectful in your feedback</li>
                  <li>• Focus on your actual experience during the stay</li>
                  <li>• Avoid personal attacks or discriminatory language</li>
                  <li>• Don't include personal contact information</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createReview.isPending || overallRating === 0}
          >
            {createReview.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewSubmissionForm;
