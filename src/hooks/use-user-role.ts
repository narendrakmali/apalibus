
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
    // Start loading whenever auth state is uncertain.
    if (isAuthLoading || !firestore) {
      setIsLoading(true);
      return;
    }

    // If there is no user, the role is null, and we are done loading.
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const checkUserRole = async () => {
      // Set loading to true at the beginning of the check for a specific user.
      setIsLoading(true);

      try {
        // Check for Admin role
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!isCancelled && userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
          setRole('admin');
          setIsLoading(false);
          return;
        }

        // Check for Operator role
        const operatorDocRef = doc(firestore, 'busOperators', user.uid);
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (!isCancelled && operatorDocSnap.exists()) {
          setRole('operator');
          setIsLoading(false);
          return;
        }

        // If neither, it's a regular user.
        if (!isCancelled) {
          setRole('user');
        }

      } catch (error) {
        console.error("Error checking user role:", error);
        if (!isCancelled) {
          setRole('user'); // Default to 'user' on error to avoid getting stuck
        }
      } finally {
        // Only set loading to false in the final state if not already set.
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    checkUserRole();

    return () => {
      isCancelled = true;
    };
  }, [user, firestore, isAuthLoading]);

  return { role, isLoading };
};
