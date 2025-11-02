import { useQuery, useMutation } from '@tanstack/react-query';
import { orderBy, where, serverTimestamp } from 'firebase/firestore';
import type { PropertyView } from '@/lib/models';
import { addDocument, listDocuments } from '@/lib/utils/firebase';

export const usePropertyViews = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-views', propertyId],
    queryFn: async () => {
      const { data, error } = await listDocuments('propertyViews', [
        where('property_id', '==', propertyId),
        orderBy('viewed_at', 'desc'),
      ]);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!propertyId,
  });
};

export const usePropertyAnalytics = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-analytics', propertyId],
    queryFn: async () => {
      const { data, error } = await listDocuments('propertyViews', [where('property_id', '==', propertyId)]);
      if (error) throw error;
      const views = data ?? [];

      const totalViews = views.length;
      const today = new Date();
      const viewsToday = views.filter((view) => {
        if (!view.viewed_at) return false;
        const viewDate = new Date(view.viewed_at);
        return viewDate.toDateString() === today.toDateString();
      }).length;

      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const viewsThisWeek = views.filter((view) => {
        if (!view.viewed_at) return false;
        const viewDate = new Date(view.viewed_at);
        return viewDate >= weekAgo;
      }).length;

      return {
        totalViews,
        viewsToday,
        viewsThisWeek,
        viewHistory: views
          .map((view) => view.viewed_at)
          .filter((timestamp): timestamp is string => Boolean(timestamp)),
      };
    },
    enabled: !!propertyId,
  });
};

export const useTrackPropertyView = () => {
  return useMutation({
    mutationFn: async ({ propertyId, userId }: { propertyId: string; userId?: string }) => {
      const payload = {
        property_id: propertyId,
        user_id: userId ?? null,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        viewed_at: serverTimestamp(),
        created_at: serverTimestamp(),
      };
      const { data, error } = await addDocument('propertyViews', payload as Omit<PropertyView, 'id'>);
      if (error) throw error;
      return data?.id ?? null;
    },
  });
};
