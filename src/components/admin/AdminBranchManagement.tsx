import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MapPin, Building2, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { addDocument, listDocuments, logAdminActivity, setDocument } from '@/lib/utils/firebase';
import { removeUndefined } from '@/lib/utils/remove-undfined';
import type { Branch } from '@/lib/models';

type BranchForm = Omit<Branch, 'id' | 'created_at' | 'updated_at'>;

const defaultBranch: BranchForm = {
  name: '',
  location: '',
  manager_name: '',
  phone: '',
  email: '',
};

const AdminBranchManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formState, setFormState] = useState(defaultBranch);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      const { data, error } = await listDocuments('branches', [orderBy('created_at', 'desc')]);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredBranches = useMemo(() => {
    if (!searchTerm) return branches;
    const normalised = searchTerm.toLowerCase();
    return branches.filter(
      (branch) =>
        branch.name.toLowerCase().includes(normalised) ||
        branch.location.toLowerCase().includes(normalised) ||
        branch.manager_name?.toLowerCase().includes(normalised ?? ''),
    );
  }, [branches, searchTerm]);

  const saveBranchMutation = useMutation({
    mutationFn: async (payload: { id?: string } & BranchForm) => {
      if (payload.id) {
        await setDocument(
          'branches',
          payload.id,
          removeUndefined({
            ...payload,
            updated_at: serverTimestamp(),
          }),
        );
      } else {
        await addDocument('branches', {
          ...payload,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        } as Omit<Branch, 'id'>);
      }

      await logAdminActivity({
        actorId: user?.uid ?? 'system',
        actorEmail: user?.email ?? undefined,
        action: payload.id ? 'Updated branch' : 'Created branch',
        entityType: 'branch',
        entityId: payload.id,
        metadata: removeUndefined({
          name: payload.name,
          location: payload.location,
          manager: payload.manager_name ?? null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      toast({
        title: 'Branch saved',
        description: 'Branch details have been updated.',
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error saving branch:', error);
      toast({
        title: 'Error',
        description: 'Failed to save branch. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    setEditingBranch(null);
    setFormState(defaultBranch);
    setDialogOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormState({
      name: branch.name,
      location: branch.location,
      manager_name: branch.manager_name ?? '',
      phone: branch.phone ?? '',
      email: branch.email ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    saveBranchMutation.mutate({
      ...formState,
      id: editingBranch?.id,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branch Management
          </CardTitle>
          <CardDescription>Manage company branches and their contact details.</CardDescription>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          placeholder="Search branches by name, location, or manager"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Loading branches...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredBranches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No branches found.
                  </TableCell>
                </TableRow>
              )}
              {filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {branch.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created{' '}
                      {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell>
                    {branch.manager_name ? (
                      branch.manager_name
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{branch.phone || '—'}</div>
                    <div className="text-xs text-muted-foreground">{branch.email || '—'}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(branch)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
            <DialogDescription>Provide branch details and contact information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Branch Name</Label>
              <Input
                className="mt-1"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                className="mt-1"
                value={formState.location}
                onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
              />
            </div>
            <div>
              <Label>Manager Name</Label>
              <Input
                className="mt-1"
                value={formState.manager_name ?? ''}
                onChange={(event) => setFormState((prev) => ({ ...prev, manager_name: event.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Phone</Label>
                <Input
                  className="mt-1"
                  value={formState.phone ?? ''}
                  onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className="mt-1"
                  value={formState.email ?? ''}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formState.name || !formState.location}>
              Save Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminBranchManagement;

