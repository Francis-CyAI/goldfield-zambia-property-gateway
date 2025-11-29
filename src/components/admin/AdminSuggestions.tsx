import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useSuggestions, useUpdateSuggestionStatus } from '@/hooks/useSuggestions';
import type { Suggestion } from '@/lib/models';
import { Filter, MessageSquare } from 'lucide-react';

const statusVariant: Record<Suggestion['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  in_review: 'secondary',
  resolved: 'outline',
};

const formatDateTime = (value?: unknown) => {
  if (!value) return '—';
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'string' || typeof value === 'number') return new Date(value).toLocaleString();
  if (typeof value === 'object' && value !== null && 'toDate' in (value as any)) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toLocaleString();
  }
  return '—';
};

const AdminSuggestions = () => {
  const { data: suggestions = [], isLoading } = useSuggestions({ scope: 'admin' });
  const updateStatus = useUpdateSuggestionStatus();

  const [statusFilter, setStatusFilter] = useState<'all' | Suggestion['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Suggestion['type']>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Suggestion['status']>('new');

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((suggestion) => {
      const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter;
      const matchesType = typeFilter === 'all' || suggestion.type === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [suggestions, statusFilter, typeFilter]);

  const handleOpen = (suggestion: Suggestion) => {
    setSelected(suggestion);
    setStatus(suggestion.status);
    setNotes(suggestion.resolution_notes ?? '');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!selected) return;
    updateStatus.mutate(
      {
        suggestionId: selected.id,
        status,
        resolution_notes: notes.trim() || null,
      },
      { onSuccess: () => setDialogOpen(false) },
    );
  };

  const renderRows = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
            Loading suggestions...
          </TableCell>
        </TableRow>
      );
    }

    if (filteredSuggestions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
            No suggestions match the selected filters.
          </TableCell>
        </TableRow>
      );
    }

    return filteredSuggestions.map((suggestion) => (
      <TableRow key={suggestion.id}>
        <TableCell>
          <div className="font-medium">{suggestion.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{suggestion.message}</div>
        </TableCell>
        <TableCell className="capitalize">
          <Badge variant="outline">{suggestion.type}</Badge>
        </TableCell>
        <TableCell className="capitalize">
          <Badge variant="outline">{suggestion.category ?? 'other'}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant={statusVariant[suggestion.status]} className="capitalize">
            {suggestion.status.replace('_', ' ')}
          </Badge>
        </TableCell>
        <TableCell className="capitalize">
          <Badge variant="secondary">{suggestion.priority ?? 'medium'}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="outline" size="sm" onClick={() => handleOpen(suggestion)}>
            Review
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Suggestions & Feedback
        </CardTitle>
        <CardDescription>Review feature requests, bug reports, and general feedback.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filter submissions
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | Suggestion['status'])}
            >
              <SelectTrigger className="sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_review">In review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as 'all' | Suggestion['type'])}
            >
              <SelectTrigger className="sm:w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderRows()}</TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              Submitted {formatDateTime(selected?.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {selected && (
                <>
                  <Badge variant="outline" className="capitalize">
                    {selected.type}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {selected.category ?? 'other'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    Priority: {selected.priority ?? 'medium'}
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-line">{selected?.message}</p>
            {selected?.contact_email && (
              <p className="text-xs text-muted-foreground">
                Contact: {selected.contact_email}
                {selected.contact_phone ? ` • ${selected.contact_phone}` : ''}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                <Select value={status} onValueChange={(value) => setStatus(value as Suggestion['status'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_review">In review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Resolution notes</p>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Notes to keep track of follow-up actions"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSave} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminSuggestions;
