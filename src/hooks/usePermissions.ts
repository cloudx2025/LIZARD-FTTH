import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function usePermissions() {
  const [role, setRole] = useState<string>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRole();
    }
  }, [user]);

  const loadRole = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) {
      setRole(data.role);
      setIsAdmin(data.role === 'admin');
    }
    setLoading(false);
  };

  return { role, isAdmin, loading };
}
