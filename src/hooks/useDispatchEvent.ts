import { useCallback, useMemo, useRef, useState } from 'react';
import { DEMO_BASES } from '../data/demoBases';
import { nearestBases } from '../lib/nearestBases';
import type { DispatchEvent, NearbyBase } from '../types/dispatch';

export type NewEventInput = Omit<DispatchEvent, 'id' | 'createdAt'>;

const NEARBY_COUNT = 4;

/** Estado local del evento activo y de sus bases cercanas (sin backend). */
export function useDispatchEvent() {
  const [event, setEvent] = useState<DispatchEvent | null>(null);
  const sequence = useRef(0);

  const createEvent = useCallback((input: NewEventInput) => {
    sequence.current += 1;
    setEvent({
      ...input,
      id: `DEMO-EVT-${String(sequence.current).padStart(4, '0')}`,
      createdAt: new Date(),
    });
  }, []);

  const clearEvent = useCallback(() => setEvent(null), []);

  const nearby: NearbyBase[] = useMemo(
    () => (event ? nearestBases(event.coordinates, DEMO_BASES, NEARBY_COUNT) : []),
    [event],
  );

  return { event, nearby, createEvent, clearEvent };
}
