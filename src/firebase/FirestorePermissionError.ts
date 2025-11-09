export class FirestorePermissionError extends Error {
    operation: string;
    path: string;
  
    constructor({ operation, path }: { operation: string; path: string }) {
      super(`Missing or insufficient permissions to ${operation} at path: ${path}`);
      this.name = 'FirestorePermissionError';
      this.operation = operation;
      this.path = path;
  
      // Optional: preserve stack trace if available
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, FirestorePermissionError);
      }
    }
  }