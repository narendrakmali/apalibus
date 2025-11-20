
import { EventEmitter } from 'events';

// It's crucial to use a single instance of the emitter throughout the app.
// We declare it here and export it.
export const errorEmitter = new EventEmitter();
