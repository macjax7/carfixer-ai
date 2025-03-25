
import type { Session } from '@supabase/supabase-js';
import type { UserWithCustomAttributes } from '@/integrations/supabase/client';

export interface AuthContextType {
  user: UserWithCustomAttributes | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth?: () => Promise<void>; // Make this optional to fix type error
}
