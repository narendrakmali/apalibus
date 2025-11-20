
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a client-side component that will listen for the custom error event.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // The Next.js development overlay will automatically pick up
      // uncaught exceptions. By throwing the error here, we ensure it's
      // displayed with the rich, contextual information.
      // We wrap it in a timeout to break out of the current event loop
      // and ensure it's treated as a new, uncaught exception.
      setTimeout(() => {
        throw error;
      }, 0);
    };

    errorEmitter.on('permission-error', handleError);

    // Clean up the listener when the component unmounts.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything to the UI.
  return null;
}
