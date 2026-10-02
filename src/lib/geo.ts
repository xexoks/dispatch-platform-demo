import type { Coordinates } from '../types/dispatch';

/** Radio medio terrestre (IUGG) en kilómetros. */
export const EARTH_RADIUS_KM = 6371.0088;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Distancia ortodrómica entre dos puntos usando la fórmula de haversine. */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rumbo inicial (azimut) desde `from` hacia `to`, en grados [0, 360). */
export function initialBearingDeg(from: Coordinates, to: Coordinates): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLon = toRad(to.lon - from.lon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// prettier-ignore
const CARDINALS_16 = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO',
] as const;

/** Convierte un rumbo en grados a la rosa de 16 puntos (en español: O = oeste). */
export function toCardinal(bearingDeg: number): string {
  const normalized = ((bearingDeg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return CARDINALS_16[index] ?? 'N';
}

export const isValidLat = (lat: number) => Number.isFinite(lat) && lat >= -90 && lat <= 90;
export const isValidLon = (lon: number) => Number.isFinite(lon) && lon >= -180 && lon <= 180;

/** Interpreta texto como grados decimales. Acepta punto o coma decimal. */
export function parseDecimalDegrees(input: string): number | null {
  const trimmed = input.trim().replace(',', '.');
  if (!/^[-+]?\d+(\.\d+)?$/.test(trimmed)) return null;
  return Number(trimmed);
}

export type CoordinateErrors = Partial<Record<keyof Coordinates, string>>;

export type ParseCoordinatesResult =
  | { ok: true; value: Coordinates }
  | { ok: false; errors: CoordinateErrors };

/** Valida un par lat/lon escrito como texto. Devuelve coordenadas o errores por campo. */
export function parseCoordinates(latText: string, lonText: string): ParseCoordinatesResult {
  const errors: CoordinateErrors = {};
  const lat = parseDecimalDegrees(latText);
  const lon = parseDecimalDegrees(lonText);

  if (lat === null) errors.lat = 'Ingresa un número en grados decimales.';
  else if (!isValidLat(lat)) errors.lat = 'La latitud debe estar entre -90 y 90.';

  if (lon === null) errors.lon = 'Ingresa un número en grados decimales.';
  else if (!isValidLon(lon)) errors.lon = 'La longitud debe estar entre -180 y 180.';

  if (lat === null || lon === null || errors.lat || errors.lon) return { ok: false, errors };
  return { ok: true, value: { lat, lon } };
}

/** Formatea grados decimales como grados, minutos y segundos, p. ej. 33°30'00.0" S. */
export function toDMS(value: number, axis: 'lat' | 'lon'): string {
  const hemisphere = axis === 'lat' ? (value < 0 ? 'S' : 'N') : value < 0 ? 'O' : 'E';
  // Se trabaja en décimas de segundo enteras para evitar resultados como 60.0".
  const totalTenths = Math.round(Math.abs(value) * 36000);
  const deg = Math.floor(totalTenths / 36000);
  const min = Math.floor((totalTenths % 36000) / 600);
  const sec = (totalTenths % 600) / 10;
  return `${deg}°${String(min).padStart(2, '0')}'${sec.toFixed(1).padStart(4, '0')}" ${hemisphere}`;
}

export const formatDecimal = (value: number, digits = 5) => value.toFixed(digits);
