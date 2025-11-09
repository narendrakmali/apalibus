
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
    // Always be in a loading state if auth is loading or if we have a user but no role yet.
    setIsLoading(isAuthLoading || (!!user && !role));

    if (isAuthLoading || !firestore) {
      // If auth is loading or firestore is not ready, we can't do anything.
      // The isLoading state is already set above.
      return;
    }
    
    if (!user) {
      // No user, so no role. We are done loading.
      setRole(null);
      setIsLoading(false);
      return;
    }

    // We have a user, but maybe we've already determined the role.
    // If a role is already set, we don't need to re-check.
    if (role) {
        setIsLoading(false);
        return;
    }


    let isCancelled = false;

    const checkUserRole = async () => {
      try {
        // Check for Admin
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
          if (!isCancelled) setRole('admin');
          return; // Found role, no need to check further
        }

        // Check for Operator
        const operatorDocRef = doc(firestore, 'busOperators', user.uid);
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (operatorDocSnap.exists()) {
          if (!isCancelled) setRole('operator');
          return; // Found role
        }

        // If neither, they are a standard 'user'
        if (!isCancelled) setRole('user');

      } catch (error) {
        console.error("Error checking user role:", error);
        if (!isCancelled) setRole('user'); // Default to 'user' on error
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    checkUserRole();

    return () => {
      isCancelled = true;
    };
  // IMPORTANT: We add `role` to the dependency array. 
  // This ensures that if the role is cleared on logout, the effect re-evaluates.
  }, [user, firestore, isAuthLoading, role]);

  return { role, isLoading };
};
