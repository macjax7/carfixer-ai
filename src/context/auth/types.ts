
import type { Session } from '@supabase/supabase-js';
import type { UserWithCustomAttributes } from '@/integrations/supabase/client';

export interface AuthContextType {
  user: UserWithCustomAttributes | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
