import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (status === 'connected') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);

  const checkConnection = async () => {
    try {
      // Test the connection
      const { data, error } = await supabase.from('teachers').select('count').limit(1);
      
      if (error) {
        setStatus('error');
        setError(error.message);
      } else {
        setStatus('connected');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  // Don't render if not visible
  if (!isVisible && status === 'connected') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center px-3 py-2 rounded-lg shadow-lg ${
        status === 'connected' ? 'bg-green-100 text-green-800' :
        status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {status === 'checking' && <Loader className="h-4 w-4 mr-2 animate-spin" />}
        {status === 'connected' && <CheckCircle className="h-4 w-4 mr-2" />}
        {status === 'error' && <XCircle className="h-4 w-4 mr-2" />}
        
        <span className="text-sm font-medium">
          {status === 'checking' && 'Checking connection...'}
          {status === 'connected' && 'Database Connected'}
          {status === 'error' && `Connection Error: ${error}`}
        </span>
      </div>
    </div>
  );
}