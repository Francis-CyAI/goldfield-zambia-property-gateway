import { useQuery, useMutation } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/constants/firebase';
import { serializeDocs } from '@/lib/utils/firestore-serialize';

export interface PropertyView {
  id: string;
  property_id: string;
  user_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  viewed_at?: string | null;
}

export const usePropertyViews = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-views', propertyId],
    queryFn: async () => {
      const viewsRef = collection(db, COLLECTIONS.propertyViews);
      const viewsQuery = query(
        viewsRef,
        where('property_id', '==', propertyId),
        orderBy('viewed_at', 'desc'),
      );
      const snapshot = await getDocs(viewsQuery);
      return serializeDocs<PropertyView>(snapshot);
    },
    enabled: !!propertyId,
  });
};

export const usePropertyAnalytics = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-analytics', propertyId],
    queryFn: async () => {
      const viewsRef = collection(db, COLLECTIONS.propertyViews);
      const viewsQuery = query(viewsRef, where('property_id', '==', propertyId));
      const snapshot = await getDocs(viewsQuery);
      const views = serializeDocs<PropertyView>(snapshot);

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
      const viewsRef = collection(db, COLLECTIONS.propertyViews);
      const payload = {
        property_id: propertyId,
        user_id: userId ?? null,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        viewed_at: serverTimestamp(),
        created_at: serverTimestamp(),
      };
      const docRef = await addDoc(viewsRef, payload);
      return docRef.id;
    },
  });
};

