
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
    // Start loading whenever the auth state is loading.
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    // If there's no user, role is null and we are done loading.
    if (!user || !firestore) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // If there is a user, start the async check.
    setIsLoading(true);
    let isCancelled = false;

    const checkUserRole = async () => {
      try {
        // Check for Admin
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
          if (!isCancelled) {
            setRole('admin');
            setIsLoading(false);
          }
          return; // Found role, no need to check further
        }

        // Check for Operator
        const operatorDocRef = doc(firestore, 'busOperators', user.uid);
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (operatorDocSnap.exists()) {
          if (!isCancelled) {
            setRole('operator');
            setIsLoading(false);
          }
          return; // Found role
        }

        // If neither, they are a standard 'user'
        if (!isCancelled) {
          setRole('user');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        if (!isCancelled) {
          setRole('user'); // Default to 'user' on error
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
