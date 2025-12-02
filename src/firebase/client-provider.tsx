
'use client';

import * as React from 'react';
import { ReactNode } from 'react';
import { getSdks, initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseContext = React.useMemo(() => {
    const { firebaseApp, ...sdks } = initializeFirebase();
    return { ...getSdks(firebaseApp), firebaseApp };
  }, []);

  return <FirebaseProvider {...firebaseContext}>{children}</FirebaseProvider>;
}
