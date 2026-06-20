/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { FoodFixMain } from './components/FoodFixMain';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (!isAuthenticated && !isDemoMode) {
    return (
      <LoginPage 
        onDemoLogin={() => setIsDemoMode(true)} 
        isConfigured={isSupabaseConfigured} 
      />
    );
  }

  return <FoodFixMain />;
}
