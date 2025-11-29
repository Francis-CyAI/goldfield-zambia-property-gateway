import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, MessageSquare, Sparkles, ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmitSuggestion, useSuggestions } from '@/hooks/useSuggestions';

type SuggestionFormState = {
  title: string;
  message: string;
  type: 'feedback' | 'feature' | 'bug';
  category: 'bookings' | 'listings' | 'payouts' | 'support' | 'other';
  priority: 'low' | 'medium' | 'high';
  contact_email?: string;
  contact_phone?: string;
};

const formatDate = (value?: unknown) => {
  if (!value) return '';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'string' || typeof value === 'number') return new Date(value).toLocaleDateString();
  if (typeof value === 'object' && value !== null && 'toDate' in (value as any)) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toLocaleDateString();
  }
  return '';
};

const Suggestions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const submitSuggestion = useSubmitSuggestion();
  const { data: suggestions = [], isLoading } = useSuggestions({ scope: 'user', userId: user?.uid });

  const [formState, setFormState] = useState<SuggestionFormState>({
    title: '',
    message: '',
    type: 'feedback',
    category: 'other',
    priority: 'medium',
    contact_email: user?.email ?? '',
    contact_phone: '',
  });

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      contact_email: user?.email ?? '',
    }));
  }, [user?.email]);

  const handleChange = (key: keyof SuggestionFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || submitSuggestion.isPending || !canSubmit) return;

    submitSuggestion.mutate(
      {
        title: formState.title.trim(),
        message: formState.message.trim(),
        type: formState.type,
        category: formState.category,
        priority: formState.priority,
        contact_email: formState.contact_email?.trim(),
        contact_phone: formState.contact_phone?.trim(),
      },
      {
        onSuccess: () => {
          setFormState((prev) => ({
            ...prev,
            title: '',
            message: '',
            priority: 'medium',
          }));
        },
      },
    );
  };

  const canSubmit = useMemo(() => {
    return (
      formState.title.trim().length > 3 &&
      formState.message.trim().length > 10
    );
  }, [formState.title, formState.message]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Share your ideas</CardTitle>
            <CardDescription>
              Sign in to submit feedback and feature requests to our team.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button onClick={() => navigate('/auth')}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Suggestions box</h1>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tell us what would make your experience better. We review every submission and keep you
            posted on progress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Share an idea
              </CardTitle>
              <CardDescription>Feature requests, bugs, or general feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Type</Label>
                    <Select
                      value={formState.type}
                      onValueChange={(value) => handleChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feedback">Product feedback</SelectItem>
                        <SelectItem value="feature">Feature request</SelectItem>
                        <SelectItem value="bug">Bug report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Category</Label>
                    <Select
                      value={formState.category}
                      onValueChange={(value) => handleChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bookings">Bookings</SelectItem>
                        <SelectItem value="listings">Listings</SelectItem>
                        <SelectItem value="payouts">Payouts</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Priority</Label>
                    <Select
                      value={formState.priority}
                      onValueChange={(value) => handleChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Nice to have</SelectItem>
                        <SelectItem value="medium">Important</SelectItem>
                        <SelectItem value="high">Blocking issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Title</Label>
                  <Input
                    value={formState.title}
                    onChange={(event) => handleChange('title', event.target.value)}
                    placeholder="e.g. Support bank transfers for payouts"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Details</Label>
                  <Textarea
                    value={formState.message}
                    onChange={(event) => handleChange('message', event.target.value)}
                    placeholder="Explain what you need or what went wrong..."
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include any steps to reproduce or screenshots/links if applicable.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Contact email</Label>
                    <Input
                      type="email"
                      value={formState.contact_email}
                      onChange={(event) => handleChange('contact_email', event.target.value)}
                      placeholder="name@email.com"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Phone (optional)</Label>
                    <Input
                      value={formState.contact_phone}
                      onChange={(event) => handleChange('contact_phone', event.target.value)}
                      placeholder="+260..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!canSubmit || submitSuggestion.isPending}
                  >
                    {submitSuggestion.isPending ? 'Submitting...' : 'Send feedback'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Recent submissions
              </CardTitle>
              <CardDescription>Track what you have shared with us</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-6">
                  Nothing here yet. Share your first idea!
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.slice(0, 5).map((suggestion) => (
                    <div key={suggestion.id} className="p-3 border rounded-lg bg-white shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {suggestion.type}
                          </Badge>
                          <Badge
                            variant={
                              suggestion.status === 'resolved'
                                ? 'secondary'
                                : suggestion.status === 'in_review'
                                  ? 'outline'
                                  : 'default'
                            }
                            className="capitalize"
                          >
                            {suggestion.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(suggestion.created_at)}
                        </span>
                      </div>
                      <p className="font-medium text-sm mt-2">{suggestion.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{suggestion.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-primary/10 bg-primary/5">
          <CardContent className="py-6 flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-semibold text-gray-900">What happens next?</p>
              <p className="text-sm text-gray-700">
                We triage suggestions weekly. If we have questions, we will reach out using the
                contact details you provided. Status updates will show above once we review them.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Suggestions;
