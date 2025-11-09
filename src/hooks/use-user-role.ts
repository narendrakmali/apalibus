
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
    // We cannot proceed if Firebase Auth is still loading or if Firestore isn't available.
    if (isAuthLoading || !firestore) {
      setIsLoading(true); // Explicitly stay in loading state
      return;
    }
    
    // If there is no authenticated user, the role is null and we are done loading.
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // This flag prevents state updates on an unmounted component.
    let isCancelled = false;

    const checkUserRole = async () => {
      setIsLoading(true); // Ensure we are in a loading state at the start of the check
      try {
        // 1. Check for Admin role
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data()?.isAdmin === true) {
          if (!isCancelled) {
            setRole('admin');
          }
          return; // Found role, exit.
        }

        // 2. Check for Operator role
        const operatorDocRef = doc(firestore, 'busOperators', user.uid);
        const operatorDocSnap = await getDoc(operatorDocRef);
        if (operatorDocSnap.exists()) {
          if (!isCancelled) {
            setRole('operator');
          }
          return; // Found role, exit.
        }

        // 3. If neither of the above, assign the default 'user' role.
        if (!isCancelled) {
          setRole('user');
        }

      } catch (error) {
        console.error("Error checking user role:", error);
        // On error, default to 'user' role to prevent being stuck in a loading state.
        if (!isCancelled) {
          setRole('user');
        }
      } finally {
        // No matter the outcome (success or error), the check is complete.
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    checkUserRole();

    // Cleanup function to prevent state updates if the component unmounts during the async check.
    return () => {
      isCancelled = true;
    };
  // This effect depends on the user object, Firestore instance, and the initial auth loading state.
  }, [user, firestore, isAuthLoading]);

  return { role, isLoading };
};
