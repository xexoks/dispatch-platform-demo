import type { Base, Coordinates, NearbyBase } from '../types/dispatch';
import { haversineKm, initialBearingDeg, toCardinal } from './geo';

/** Devuelve las `count` bases más cercanas al punto, ordenadas por distancia ascendente. */
export function nearestBases(origin: Coordinates, bases: readonly Base[], count = 4): NearbyBase[] {
  return bases
    .map((b) => {
      const bearingDeg = initialBearingDeg(origin, b.coordinates);
      return {
        ...b,
        distanceKm: haversineKm(origin, b.coordinates),
        bearingDeg,
        cardinal: toCardinal(bearingDeg),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, Math.max(0, count));
}
