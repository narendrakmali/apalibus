
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
    // Don't do anything until Firebase auth is resolved and Firestore is available
    if (isUserLoading || !firestore) {
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

      // 1. Check for Admin status first
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
        setRole('admin');
        setIsLoading(false);
        return;
      }

      // 2. Check for Operator status
      const operatorDocRef = doc(firestore, 'busOperators', user.uid);
      try {
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (operatorDocSnap.exists()) {
          setRole('operator');
        } else {
          // 3. Default to User
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
