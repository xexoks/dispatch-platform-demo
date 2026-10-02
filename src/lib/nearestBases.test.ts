import { describe, expect, it } from 'vitest';
import { DEMO_BASES } from '../data/demoBases';
import type { Base } from '../types/dispatch';
import { nearestBases } from './nearestBases';

const mk = (id: string, lat: number, lon: number): Base => ({
  id,
  name: `Base DEMO ${id}`,
  coordinates: { lat, lon },
  demo: true,
});

describe('nearestBases', () => {
  const bases = [mk('lejos', 0, 3), mk('cerca', 0, 1), mk('medio', 0, 2), mk('norte', 0.5, 0), mk('sur', -4, 0)];

  it('devuelve 4 bases ordenadas por distancia', () => {
    const r = nearestBases({ lat: 0, lon: 0 }, bases);
    expect(r.map((b) => b.id)).toEqual(['norte', 'cerca', 'medio', 'lejos']);
    for (let i = 1; i < r.length; i++) {
      expect(r[i]!.distanceKm).toBeGreaterThanOrEqual(r[i - 1]!.distanceKm);
    }
  });

  it('incluye rumbo y cardinal', () => {
    const [first, second] = nearestBases({ lat: 0, lon: 0 }, bases, 2);
    expect(first?.cardinal).toBe('N');
    expect(second?.bearingDeg).toBeCloseTo(90, 6);
    expect(second?.cardinal).toBe('E');
  });

  it('respeta count y no muta la entrada', () => {
    const copy = [...bases];
    expect(nearestBases({ lat: 0, lon: 0 }, bases, 2)).toHaveLength(2);
    expect(nearestBases({ lat: 0, lon: 0 }, bases, 0)).toHaveLength(0);
    expect(bases).toEqual(copy);
  });
});

describe('catálogo DEMO', () => {
  it('todas las bases son ficticias y usan el prefijo "Base DEMO"', () => {
    expect(DEMO_BASES.length).toBeGreaterThanOrEqual(4);
    for (const b of DEMO_BASES) {
      expect(b.demo).toBe(true);
      expect(b.name.startsWith('Base DEMO ')).toBe(true);
      expect(b.id.startsWith('DEMO-')).toBe(true);
    }
  });

  it('tiene ids únicos', () => {
    expect(new Set(DEMO_BASES.map((b) => b.id)).size).toBe(DEMO_BASES.length);
  });
});
