import type { Base } from '../types/dispatch';

/**
 * Catálogo DEMO "Zona DEMO Chile Central".
 *
 * Todas las bases y coordenadas son INVENTADAS para esta demo de portafolio.
 * Se ubicaron de forma aproximada sobre una grilla redondeada a 0,1° y no
 * representan instalaciones reales ni ubicaciones operacionales.
 */
export const DEMO_ZONE_NAME = 'Zona DEMO Chile Central';

export const DEMO_ZONE_CENTER = { lat: -34.3, lon: -71.2 } as const;

/** Rectángulo aproximado de la zona DEMO: [oeste, sur, este, norte]. */
export const DEMO_ZONE_BBOX: [number, number, number, number] = [-72.2, -35.6, -70.4, -33.0];

const base = (id: string, suffix: string, lat: number, lon: number): Base => ({
  id,
  name: `Base DEMO ${suffix}`,
  coordinates: { lat, lon },
  demo: true,
});

export const DEMO_BASES: readonly Base[] = [
  base('DEMO-B01', 'Alfa', -33.2, -71.5),
  base('DEMO-B02', 'Bravo', -33.4, -70.9),
  base('DEMO-B03', 'Charlie', -33.7, -71.7),
  base('DEMO-B04', 'Delta', -33.9, -71.1),
  base('DEMO-B05', 'Echo', -34.1, -70.6),
  base('DEMO-B06', 'Foxtrot', -34.3, -71.9),
  base('DEMO-B07', 'Golf', -34.5, -71.3),
  base('DEMO-B08', 'Hotel', -34.7, -70.8),
  base('DEMO-B09', 'India', -34.9, -71.8),
  base('DEMO-B10', 'Juliett', -35.1, -71.2),
  base('DEMO-B11', 'Kilo', -35.3, -71.6),
  base('DEMO-B12', 'Lima', -35.4, -70.7),
];
