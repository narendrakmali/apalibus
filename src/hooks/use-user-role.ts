
'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type UserRole = 'operator' | 'admin' | 'user' | null;

export const useUserRole = () => {
  const { user, firestore, isUserLoading: isAuthLoading } = useFirebase();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start loading whenever auth state is changing.
    setIsLoading(true);

    if (isAuthLoading || !firestore) {
      // If auth is loading or firestore is not ready, we must wait.
      // The isLoading state is already true, so we just return.
      return;
    }
    
    if (!user) {
      // No user, so no role. We are done loading for this state.
      setRole(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const checkUserRole = async () => {
      try {
        // Check for Admin role
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
          if (!isCancelled) setRole('admin');
          return;
        }

        // Check for Operator role
        const operatorDocRef = doc(firestore, 'busOperators', user.uid);
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (operatorDocSnap.exists()) {
          if (!isCancelled) setRole('operator');
          return;
        }

        // If neither admin nor operator, assign 'user' role
        if (!isCancelled) setRole('user');

      } catch (error) {
        console.error("Error checking user role:", error);
        // On error, default to 'user' role but stop loading.
        if (!isCancelled) setRole('user');
      } finally {
        // No matter the outcome, the check is complete.
        if (!isCancelled) setIsLoading(false);
      }
    };

    checkUserRole();

    return () => {
      isCancelled = true;
    };
  // Re-run the effect if the user or auth loading state changes.
  }, [user, firestore, isAuthLoading]);

  return { role, isLoading };
};
