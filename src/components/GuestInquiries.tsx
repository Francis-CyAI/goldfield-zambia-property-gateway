
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  Clock,
  Reply,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const GuestInquiries = () => {
  // Mock data for demonstration
  const inquiries = [
    {
      id: '1',
      guest_name: 'Sarah Johnson',
      property_title: 'Modern Apartment in Lusaka',
      subject: 'Booking Inquiry for Weekend Stay',
      message: 'Hi! I\'m interested in booking your apartment for the weekend of March 15-17. Can you confirm availability?',
      inquiry_type: 'booking',
      status: 'unread',
      check_in_date: '2024-03-15',
      check_out_date: '2024-03-17',
      guest_count: 2,
      created_at: new Date('2024-01-15T10:30:00Z')
    },
    {
      id: '2',
      guest_name: 'Mike Chen',
      property_title: 'Cozy Studio in Ndola',
      subject: 'Question about Amenities',
      message: 'Does the property have WiFi and parking available? Also, is it pet-friendly?',
      inquiry_type: 'general',
      status: 'replied',
      created_at: new Date('2024-01-14T14:20:00Z')
    },
    {
      id: '3',
      guest_name: 'Emma Wilson',
      property_title: 'Villa with Pool in Livingstone',
      subject: 'Special Occasion Booking',
      message: 'I\'m planning a birthday celebration and would like to know about your cancellation policy and any special arrangements you might offer.',
      inquiry_type: 'special_request',
      status: 'unread',
      created_at: new Date('2024-01-13T16:45:00Z')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'destructive';
      case 'replied':
        return 'default';
      case 'resolved':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getInquiryTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'default';
      case 'general':
        return 'secondary';
      case 'special_request':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Guest Inquiries</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="destructive">3 Unread</Badge>
          <Button variant="outline" size="sm">
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className={`${inquiry.status === 'unread' ? 'border-orange-200 bg-orange-50' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {inquiry.subject}
                  </CardTitle>
                  <CardDescription>
                    From <strong>{inquiry.guest_name}</strong> • {inquiry.property_title}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getInquiryTypeColor(inquiry.inquiry_type)}>
                    {inquiry.inquiry_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getStatusColor(inquiry.status)}>
                    {inquiry.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(inquiry.created_at, 'MMM dd, yyyy • HH:mm')}
                </div>
                {inquiry.check_in_date && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(inquiry.check_in_date), 'MMM dd')} - {format(new Date(inquiry.check_out_date!), 'MMM dd')}
                  </div>
                )}
                {inquiry.guest_count && (
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {inquiry.guest_count} guests
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{inquiry.message}</p>
              </div>
              
              {inquiry.status === 'unread' && (
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Type your reply..."
                    className="min-h-[100px]"
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Read
                    </Button>
                    <Button size="sm">
                      <Reply className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              )}
              
              {inquiry.status === 'replied' && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Replied on {format(inquiry.created_at, 'MMM dd, yyyy')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {inquiries.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No inquiries yet</h3>
              <p className="text-muted-foreground">
                Guest inquiries and messages will appear here
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GuestInquiries;
