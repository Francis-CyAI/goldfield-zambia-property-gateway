
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'booking';
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: 'host' | 'guest';
  propertyTitle: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

const MessagingSystem = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: '1',
      participantName: 'Sarah Mwanza',
      participantAvatar: '/placeholder.svg',
      participantRole: 'host',
      propertyTitle: 'Beautiful Lodge in Kafue National Park',
      lastMessage: 'The check-in is at 3 PM. Looking forward to hosting you!',
      lastMessageTime: new Date('2024-06-07T10:30:00'),
      unreadCount: 2,
      messages: [
        {
          id: '1',
          senderId: 'host',
          senderName: 'Sarah Mwanza',
          senderAvatar: '/placeholder.svg',
          content: 'Hi! Thank you for booking our lodge. Is this your first time visiting Kafue?',
          timestamp: new Date('2024-06-07T09:00:00'),
          type: 'text',
          isRead: true
        },
        {
          id: '2',
          senderId: 'guest',
          senderName: 'You',
          senderAvatar: '/placeholder.svg',
          content: 'Hello! Yes, it\'s our first time. We\'re very excited. What time is check-in?',
          timestamp: new Date('2024-06-07T09:15:00'),
          type: 'text',
          isRead: true
        },
        {
          id: '3',
          senderId: 'host',
          senderName: 'Sarah Mwanza',
          senderAvatar: '/placeholder.svg',
          content: 'The check-in is at 3 PM. Looking forward to hosting you!',
          timestamp: new Date('2024-06-07T10:30:00'),
          type: 'text',
          isRead: false
        }
      ]
    },
    {
      id: '2',
      participantName: 'InterContinental Lusaka',
      participantAvatar: '/placeholder.svg',
      participantRole: 'host',
      propertyTitle: 'Luxury Hotel Suite in Lusaka',
      lastMessage: 'Your booking has been confirmed. Welcome to InterContinental!',
      lastMessageTime: new Date('2024-06-07T08:00:00'),
      unreadCount: 0,
      messages: [
        {
          id: '1',
          senderId: 'host',
          senderName: 'InterContinental Lusaka',
          senderAvatar: '/placeholder.svg',
          content: 'Your booking has been confirmed. Welcome to InterContinental!',
          timestamp: new Date('2024-06-07T08:00:00'),
          type: 'booking',
          isRead: true
        }
      ]
    }
  ];

  const currentConversation = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentConversation) return;
    
    // In real app, send message to backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex h-[600px] bg-white rounded-lg border overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>
        
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                selectedConversation === conversation.id ? 'bg-white border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.participantAvatar} />
                    <AvatarFallback>
                      {conversation.participantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Badge 
                    className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 ${
                      conversation.participantRole === 'host' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                  >
                    {conversation.participantRole}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">{conversation.participantName}</h3>
                    <span className="text-xs text-gray-500">
                      {format(conversation.lastMessageTime, 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{conversation.propertyTitle}</p>
                  <p className="text-sm text-gray-700 truncate mt-1">{conversation.lastMessage}</p>
                </div>
                
                {conversation.unreadCount > 0 && (
                  <Badge className="bg-primary text-white text-xs">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={currentConversation.participantAvatar} />
                  <AvatarFallback>
                    {currentConversation.participantName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{currentConversation.participantName}</h3>
                  <p className="text-sm text-gray-600">{currentConversation.propertyTitle}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'guest' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === 'guest' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === 'guest' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {format(message.timestamp, 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;
