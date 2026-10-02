export interface Coordinates {
  /** Latitud en grados decimales (WGS84), rango [-90, 90]. */
  lat: number;
  /** Longitud en grados decimales (WGS84), rango [-180, 180]. */
  lon: number;
}

export type EventType = 'Incendio de vegetación' | 'Emergencia vehicular' | 'Rescate' | 'Otro';

export type EventPriority = 'Alta' | 'Media' | 'Baja';

export interface DispatchEvent {
  id: string;
  name: string;
  type: EventType;
  priority: EventPriority;
  coordinates: Coordinates;
  createdAt: Date;
}

export interface Base {
  id: string;
  name: string;
  coordinates: Coordinates;
  /** Marca explícita: todas las bases de esta versión son ficticias. */
  demo: true;
}

export interface NearbyBase extends Base {
  distanceKm: number;
  bearingDeg: number;
  cardinal: string;
}
