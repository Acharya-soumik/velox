import { createClient } from '@/utils/supabase/server';
import { PostgrestError } from '@supabase/supabase-js';

interface ServerFetchResponse<T> {
  data: T[] | null;
  error: PostgrestError | null;
}

const serverFetch = async <T>(
  tableName: string,
  query: string = '*'
): Promise<ServerFetchResponse<T>> => {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(query);

    return { data: data as T[] | null, error };
  } catch (error) {
    return {
      data: null,
      error: error as PostgrestError,
    };
  }
};

export default serverFetch; 