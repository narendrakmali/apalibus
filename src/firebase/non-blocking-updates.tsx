'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  doc,
  Firestore,
} from 'firebase/firestore';
import { Auth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    )
  })
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      const newDocRef = error.ref || { path: `${colRef.path}/[new_document]` };
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: newDocRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}


/**
 * Creates an operator user and their Firestore document from the admin panel.
 * Throws an error on failure.
 */
export async function createOperatorWithEmail(auth: Auth, firestore: Firestore, { operatorName, email, password }: { operatorName: string, email: string, password: string }) {
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with operator name
      await updateProfile(user, { displayName: operatorName });

      // Create operator document in Firestore
      const operatorDocRef = doc(firestore, 'busOperators', user.uid);
      const operatorData = {
        id: user.uid,
        name: operatorName,
        contactNumber: user.phoneNumber || '', // Phone not collected in this flow
        email: user.email,
        busIds: [],
      };

      // Use a blocking setDoc here since this is a critical creation step
      await setDoc(operatorDocRef, operatorData);

    } catch (err: any) {
      console.error("Error creating operator:", err);
      // Re-throw a more user-friendly error
      throw new Error(err.message || 'Failed to create operator.');
    }
}
