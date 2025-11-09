
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
    // Always start in a loading state when dependencies change.
    setIsLoading(true);
    setRole(null);

    // Don't do anything until Firebase auth is resolved and Firestore is available.
    if (isUserLoading || !firestore) {
      // Keep loading, role is null.
      return;
    }

    // If there's no authenticated user, their role is null. Stop loading.
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    const checkUserRole = async () => {
      try {
        // 1. Check for Admin status first. This is the highest privilege.
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
          setRole('admin');
          return; // Exit after finding the role
        }

        // 2. If not an admin, check for Operator status.
        const operatorDocRef = doc(firestore, 'busOperators', user.uid);
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (operatorDocSnap.exists()) {
          setRole('operator');
          return; // Exit after finding the role
        }

        // 3. If not admin or operator, they are a standard 'user'.
        setRole('user');
      } catch (error) {
        console.error("Error checking user role:", error);
        setRole('user'); // Default to 'user' on error to be safe.
      } finally {
        // IMPORTANT: Only set loading to false after all async checks are complete.
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [user, firestore, isUserLoading]);

  return { role, isLoading };
};
