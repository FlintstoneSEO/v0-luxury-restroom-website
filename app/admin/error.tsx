'use client';

import { Button } from '@/components/ui/button';
import { AdminErrorState } from '@/components/admin/admin-feedback';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AdminErrorState
      description={error.digest ? `Reference: ${error.digest}` : 'Please retry. If the problem continues, check the admin service configuration.'}
      action={
        <Button type="button" variant="outline" onClick={reset} className="mt-3 border-red-300 bg-white text-red-800 hover:bg-red-100">
          Try again
        </Button>
      }
    />
  );
}
