'use client';

import { useEffect, useState } from 'react';
import { rtdb } from '@/lib/firebase';
import { ref, set, onValue, onDisconnect, remove, off } from 'firebase/database';
import { PresenceData } from '@/features/job/jobTypes';

/**
 * Hook to manage RTDB user presence.
 * Writes online status on mount, removes on disconnect/unmount.
 */
export function usePresence(uid: string | null, displayName: string, currentPanel: string) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceData>>({});

  // Write own presence
  useEffect(() => {
    if (!uid) return;

    const presenceRef = ref(rtdb, `presence/${uid}`);
    const presenceData: PresenceData = {
      online: true,
      displayName,
      lastSeen: Date.now(),
      currentPanel,
    };

    set(presenceRef, presenceData);
    onDisconnect(presenceRef).remove();

    return () => {
      remove(presenceRef);
    };
  }, [uid, displayName, currentPanel]);

  // Listen to all presence
  useEffect(() => {
    const presenceListRef = ref(rtdb, 'presence');
    const handler = onValue(presenceListRef, (snap) => {
      setOnlineUsers((snap.val() as Record<string, PresenceData>) || {});
    });

    return () => {
      off(presenceListRef, 'value', handler as any);
    };
  }, []);

  return { onlineUsers };
}
