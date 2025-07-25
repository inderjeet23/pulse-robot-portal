import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertyManager {
  id: string;
  user_id: string;
  email: string;
  name: string;
  routing_email: string | null;
  brand_color: string;
  logo_url: string | null;
  bot_id: string;
  hosted_link: string;
  created_at: string;
  updated_at: string;
  has_completed_onboarding: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  propertyManager: PropertyManager | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePropertyManager: (updates: Partial<PropertyManager>) => Promise<{ error: any }>;
  refreshPropertyManager: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [propertyManager, setPropertyManager] = useState<PropertyManager | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPropertyManager = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_managers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching property manager:', error);
        return;
      }

      if (data) {
        setPropertyManager(data);
      } else {
        // No property manager found, create one
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          await createPropertyManager(user, name);
        }
      }
    } catch (error) {
      console.error('Error fetching property manager:', error);
    }
  };

  const createPropertyManager = async (user: User, name: string) => {
    try {
      const { data, error } = await supabase
        .from('property_managers')
        .insert({
          user_id: user.id,
          email: user.email!,
          name: name,
          routing_email: user.email,
          hosted_link: '', // Will be auto-generated by trigger
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating property manager:', error);
        return;
      }

      setPropertyManager(data);
    } catch (error) {
      console.error('Error creating property manager:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchPropertyManager(session.user.id);
          }, 0);
        } else {
          setPropertyManager(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchPropertyManager(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
        },
      },
    });
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    if (data.user && !data.user.email_confirmed_at) {
      toast({
        title: "Check your email",
        description: "Please check your email for a confirmation link.",
      });
    } else if (data.user) {
      await createPropertyManager(data.user, name);
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUser(null);
      setSession(null);
      setPropertyManager(null);
    }
  };

  const updatePropertyManager = async (updates: Partial<PropertyManager>) => {
    if (!user || !propertyManager) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('property_managers')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setPropertyManager(data);
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
      
      return { error: null };
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const refreshPropertyManager = async () => {
    if (user) {
      await fetchPropertyManager(user.id);
    }
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/update-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error('Reset password error:', error);
      return { error };
    }
    
    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      console.error('Update password error:', error);
      return { error };
    }
    
    return { error: null };
  };

  const value = {
    user,
    session,
    propertyManager,
    loading,
    signIn,
    signUp,
    signOut,
    updatePropertyManager,
    refreshPropertyManager,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}