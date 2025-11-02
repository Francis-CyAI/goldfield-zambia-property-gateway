
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Search, Bell, BellOff, Plus } from 'lucide-react';
import { useSavedSearches, useCreateSavedSearch, useDeleteSavedSearch } from '@/hooks/useSavedSearches';
import { useAuth } from '@/contexts/AuthContext';

const SavedSearches = () => {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [newSearchCriteria, setNewSearchCriteria] = useState({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    guests: 1,
  });

  const { data: savedSearches = [], isLoading } = useSavedSearches(user?.uid);
  const createSavedSearch = useCreateSavedSearch();
  const deleteSavedSearch = useDeleteSavedSearch();

  const handleCreateSearch = async () => {
    if (!user || !newSearchName.trim()) return;

    await createSavedSearch.mutateAsync({
      user_id: user.id,
      name: newSearchName,
      search_criteria: newSearchCriteria,
      is_active: true,
      notification_enabled: false,
    });

    setIsCreateDialogOpen(false);
    setNewSearchName('');
    setNewSearchCriteria({
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      guests: 1,
    });
  };

  const handleDeleteSearch = (searchId: string) => {
    deleteSavedSearch.mutate(searchId);
  };

  const formatSearchCriteria = (criteria: Record<string, any>) => {
    const parts = [];
    if (criteria.location) parts.push(`in ${criteria.location}`);
    if (criteria.propertyType) parts.push(criteria.propertyType);
    if (criteria.minPrice || criteria.maxPrice) {
      const priceRange = `ZMW ${criteria.minPrice || '0'} - ${criteria.maxPrice || '∞'}`;
      parts.push(priceRange);
    }
    if (criteria.guests > 1) parts.push(`${criteria.guests} guests`);
    return parts.join(' • ') || 'All properties';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Searches</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Save Current Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchName">Search Name</Label>
                <Input
                  id="searchName"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="e.g., Luxury apartments in Lusaka"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newSearchCriteria.location}
                    onChange={(e) => setNewSearchCriteria(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City or area"
                  />
                </div>
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Input
                    id="propertyType"
                    value={newSearchCriteria.propertyType}
                    onChange={(e) => setNewSearchCriteria(prev => ({ ...prev, propertyType: e.target.value }))}
                    placeholder="House, Apartment, etc."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSearch} disabled={!newSearchName.trim()}>
                  Save Search
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {savedSearches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved searches</h3>
            <p className="text-gray-600 mb-4">
              Save your searches to quickly find properties that match your criteria.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Saved Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {savedSearches.map((search) => (
            <Card key={search.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{search.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      {search.notification_enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteSearch(search.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">
                  {formatSearchCriteria(search.search_criteria)}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Saved {new Date(search.created_at).toLocaleDateString()}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Run Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearches;
