import { nanoid } from 'nanoid';

/**
 * Generate a unique block ID
 */
export function generateBlockId(): string {
  return nanoid(10);
}
