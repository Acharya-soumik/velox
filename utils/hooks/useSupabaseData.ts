import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

interface FetchResponse<T> {
  data: T[] | null;
  error: PostgrestError | null;
  isLoading: boolean;
}

const useSupabaseData = <T>(
  tableName: string,
  query: string = '*',
  options: { enabled?: boolean } = { enabled: true }
) => {
  const [state, setState] = useState<FetchResponse<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!options.enabled) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const { data, error } = await supabase
          .from(tableName)
          .select(query);

        setState({
          data: data as T[] | null,
          error,
          isLoading: false,
        });
      } catch (error) {
        setState({
          data: null,
          error: error as PostgrestError,
          isLoading: false,
        });
      }
    };

    fetchData();
  }, [tableName, query, options.enabled]);

  return state;
};

export default useSupabaseData; 