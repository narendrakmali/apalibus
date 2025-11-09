
'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type UserRole = 'operator' | 'admin' | 'user' | null;

export const useUserRole = () => {
  const { user, firestore, isUserLoading } = useFirebase();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If Firebase auth is still loading, we are definitely loading the role.
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }

    // If there is no authenticated user, the role is null and we are done loading.
    if (!user || !firestore) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // If we have a user and firestore, start the async check. We are in a loading state.
    setIsLoading(true);
    let isCancelled = false;

    const checkUserRole = async () => {
      try {
        // 1. Check for Admin status.
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!isCancelled && userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
          setRole('admin');
          setIsLoading(false);
          return;
        }

        // 2. If not an admin, check for Operator status.
        const operatorDocRef = doc(firestore, 'busOperators', user.uid);
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (!isCancelled && operatorDocSnap.exists()) {
          setRole('operator');
          setIsLoading(false);
          return;
        }

        // 3. If neither, they are a standard 'user'.
        if (!isCancelled) {
          setRole('user');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        if (!isCancelled) {
          setRole('user'); // Default to 'user' on error to be safe.
          setIsLoading(false);
        }
      }
    };

    checkUserRole();

    return () => {
      isCancelled = true;
    };
  }, [user, firestore, isUserLoading]);

  return { role, isLoading };
};
