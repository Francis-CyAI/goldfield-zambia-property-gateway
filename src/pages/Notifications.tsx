import { Link } from 'react-router-dom';
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, useMarkNotificationAsRead } from '@/hooks/useNotifications';

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

const NotificationsPage = () => {
  const { user } = useAuth();
  const { data: notifications = [], isLoading } = useNotifications(user?.uid);
  const markAsRead = useMarkNotificationAsRead();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sign in to view notifications</CardTitle>
            <CardDescription>Notifications are available to authenticated users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-gray-600">All updates about your account and listings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading notifications…' : `${notifications.filter((n) => !n.is_read).length} unread`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <p>No notifications yet.</p>
              </div>
            )}

            {notifications.map((notification) => {
              const Icon = iconMap[notification.type] || Info;
              const isUnread = !notification.is_read;
              return (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => isUnread && markAsRead.mutate(notification.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      if (isUnread) {
                        markAsRead.mutate(notification.id);
                      }
                    }
                  }}
                  className={`rounded-lg border p-4 transition hover:bg-gray-50 cursor-pointer ${
                    isUnread ? 'border-primary/40 bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{notification.title}</p>
                          {isUnread && <Badge>New</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleString()
                            : ''}
                        </p>
                      </div>
                    </div>
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead.mutate(notification.id)}
                        disabled={markAsRead.isPending}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
