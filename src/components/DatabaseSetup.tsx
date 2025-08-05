import React from 'react';
import { Database, AlertCircle, ExternalLink } from 'lucide-react';

export function DatabaseSetup() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-6">
          <Database className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Setup Required</h2>
          <p className="text-gray-600">
            To use this application with persistent data storage, you need to connect to Supabase.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-left">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Setup Instructions</h3>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Click "Connect to Supabase" in the top right</li>
                <li>2. Create a new Supabase project</li>
                <li>3. The database tables will be created automatically</li>
                <li>4. Start managing your quarters and students!</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Don't have a Supabase account?
          </p>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Create Free Account
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Supabase provides a free tier with generous limits, perfect for managing student records.
          </p>
        </div>
      </div>
    </div>
  );
}