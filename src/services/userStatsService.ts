import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getErrorMessage } from '../utils/errorUtils';
import { captureError } from './telemetryService';

export async function saveUserStats(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'userStats', userId), data);
  } catch (error: unknown) {
    captureError('save_user_stats', error);
    throw new Error(getErrorMessage(error, 'Failed to save deposit stats.'));
  }
}
