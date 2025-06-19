
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyView {
  id: string;
  property_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  viewed_at: string;
}

export const usePropertyViews = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-views', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_views')
        .select('*')
        .eq('property_id', propertyId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;
      return data as PropertyView[];
    },
    enabled: !!propertyId,
  });
};

export const usePropertyAnalytics = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-analytics', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_views')
        .select('viewed_at')
        .eq('property_id', propertyId);

      if (error) throw error;

      // Process analytics data
      const totalViews = data.length;
      const today = new Date();
      const viewsToday = data.filter(view => {
        const viewDate = new Date(view.viewed_at);
        return viewDate.toDateString() === today.toDateString();
      }).length;

      const viewsThisWeek = data.filter(view => {
        const viewDate = new Date(view.viewed_at);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return viewDate >= weekAgo;
      }).length;

      return {
        totalViews,
        viewsToday,
        viewsThisWeek,
        viewHistory: data.map(view => view.viewed_at),
      };
    },
    enabled: !!propertyId,
  });
};

export const useTrackPropertyView = () => {
  return useMutation({
    mutationFn: async ({ propertyId, userId }: { propertyId: string; userId?: string }) => {
      const viewData: Partial<PropertyView> = {
        property_id: propertyId,
        user_id: userId,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
      };

      const { data, error } = await supabase
        .from('property_views')
        .insert(viewData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};
