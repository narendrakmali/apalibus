'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type UserRole = 'operator' | 'user' | null;

export const useUserRole = () => {
  const { user, firestore, isUserLoading } = useFirebase();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't do anything until Firebase auth is resolved
    if (isUserLoading) {
      return;
    }

    // If there's no user, they have no role
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    const checkUserRole = async () => {
      setIsLoading(true);
      if (!firestore) {
          setRole('user'); // Default to user if firestore is not available
          setIsLoading(false);
          return;
      }

      // Check if the user is in the busOperators collection
      const operatorDocRef = doc(firestore, 'busOperators', user.uid);
      try {
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (operatorDocSnap.exists()) {
          setRole('operator');
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setRole('user'); // Default to 'user' on error
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [user, firestore, isUserLoading]);

  return { role, isLoading };
};
