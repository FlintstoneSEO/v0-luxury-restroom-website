'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  oauth_error: 'Google sign in failed. Please try again.',
  access_denied: 'Your account is not authorized for the admin portal.',
  auth_required: 'Please sign in to access the admin portal.',
  setup_error:
    'Admin authentication is not configured. Contact support to complete Supabase setup.',
};

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('error');
    setQueryError(code ? (ERROR_MESSAGES[code] ?? 'Unable to sign in. Please try again.') : null);
    setSetupWarning(params.get('setup') === 'supabase_env_missing');
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    const callbackOrigin = window.location.origin;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${callbackOrigin}/auth/callback?next=/admin`,
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-navy/5 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gold/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-navy mb-2">Admin Portal</h1>
            <p className="text-muted-foreground">Sign in with your authorized Google account.</p>
          </div>

          {(queryError || error || setupWarning) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">
                {error ?? queryError ?? ERROR_MESSAGES.setup_error}
              </p>
            </div>
          )}

          <Button
            type="button"
            disabled={isLoading || setupWarning}
            onClick={handleGoogleLogin}
            className="w-full bg-navy hover:bg-navy/90 text-white"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Redirecting to Google...
              </>
            ) : (
              'Continue with Google'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Access is restricted to approved admin emails.
          </p>
        </div>
      </div>
    </div>
  );
}
