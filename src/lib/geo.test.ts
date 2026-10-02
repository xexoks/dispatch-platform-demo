import { describe, expect, it } from 'vitest';
import {
  haversineKm,
  initialBearingDeg,
  parseCoordinates,
  parseDecimalDegrees,
  toCardinal,
  toDMS,
} from './geo';

describe('haversineKm', () => {
  it('es cero para el mismo punto', () => {
    expect(haversineKm({ lat: -34, lon: -71 }, { lat: -34, lon: -71 })).toBe(0);
  });

  it('1° de latitud mide ~111,2 km', () => {
    expect(haversineKm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBeCloseTo(111.19, 1);
  });

  it('1° de longitud en el ecuador mide ~111,2 km', () => {
    expect(haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 1 })).toBeCloseTo(111.19, 1);
  });

  it('es simétrica', () => {
    const a = { lat: -33.5, lon: -70.7 };
    const b = { lat: -35.1, lon: -71.9 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 10);
  });

  it('cruza el antimeridiano por el camino corto', () => {
    expect(haversineKm({ lat: 0, lon: 179.5 }, { lat: 0, lon: -179.5 })).toBeCloseTo(111.19, 1);
  });
});

describe('initialBearingDeg', () => {
  const origin = { lat: 0, lon: 0 };

  it.each([
    [{ lat: 1, lon: 0 }, 0],
    [{ lat: 0, lon: 1 }, 90],
    [{ lat: -1, lon: 0 }, 180],
    [{ lat: 0, lon: -1 }, 270],
  ])('rumbo hacia %o es %d°', (to, expected) => {
    expect(initialBearingDeg(origin, to)).toBeCloseTo(expected, 6);
  });

  it('siempre devuelve un valor en [0, 360)', () => {
    const b = initialBearingDeg({ lat: -34, lon: -71 }, { lat: -34.0001, lon: -71.0001 });
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(360);
  });
});

describe('toCardinal', () => {
  it.each([
    [0, 'N'],
    [359, 'N'],
    [22.5, 'NNE'],
    [45, 'NE'],
    [90, 'E'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SO'],
    [270, 'O'],
    [315, 'NO'],
    [-90, 'O'],
    [720, 'N'],
  ])('%d° → %s', (deg, expected) => {
    expect(toCardinal(deg)).toBe(expected);
  });
});

describe('parseDecimalDegrees', () => {
  it('acepta punto y coma decimal', () => {
    expect(parseDecimalDegrees('-34.25')).toBe(-34.25);
    expect(parseDecimalDegrees(' -34,25 ')).toBe(-34.25);
  });

  it('rechaza texto inválido', () => {
    expect(parseDecimalDegrees('')).toBeNull();
    expect(parseDecimalDegrees('abc')).toBeNull();
    expect(parseDecimalDegrees('1e3')).toBeNull();
    expect(parseDecimalDegrees('--1')).toBeNull();
  });
});

describe('parseCoordinates', () => {
  it('devuelve coordenadas válidas', () => {
    expect(parseCoordinates('-34.3', '-71.2')).toEqual({ ok: true, value: { lat: -34.3, lon: -71.2 } });
  });

  it('marca errores de rango por campo', () => {
    const r = parseCoordinates('-91', '181');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.lat).toMatch(/-90 y 90/);
      expect(r.errors.lon).toMatch(/-180 y 180/);
    }
  });

  it('marca error de formato solo en el campo afectado', () => {
    const r = parseCoordinates('x', '-71');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.lat).toBeDefined();
      expect(r.errors.lon).toBeUndefined();
    }
  });
});

describe('toDMS', () => {
  it('formatea latitud sur y longitud oeste', () => {
    expect(toDMS(-33.5, 'lat')).toBe(`33°30'00.0" S`);
    expect(toDMS(-70.25, 'lon')).toBe(`70°15'00.0" O`);
  });

  it('formatea hemisferios norte y este', () => {
    expect(toDMS(10.123, 'lat')).toBe(`10°07'22.8" N`);
    expect(toDMS(5, 'lon')).toBe(`5°00'00.0" E`);
  });

  it('redondea sin producir 60 segundos', () => {
    expect(toDMS(-33.99999999, 'lat')).toBe(`34°00'00.0" S`);
  });
});
