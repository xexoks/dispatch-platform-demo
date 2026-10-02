import { useEffect, useRef, useState } from 'react';
import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
  type GeoJSONSource,
} from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection, LineString, Point, Polygon } from 'geojson';
import { DEMO_ZONE_BBOX, DEMO_ZONE_CENTER, DEMO_ZONE_NAME } from '../data/demoBases';
import { formatDecimal } from '../lib/geo';
import type { Base, Coordinates, DispatchEvent, NearbyBase } from '../types/dispatch';

/** Estilo vectorial oscuro de OpenFreeMap: público y sin claves de acceso. */
const BASEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';

// MapLibre 6 ubica su worker relativo a su propio módulo, ruta que el empaquetado de Vite
// no conserva. Se le entrega la URL del worker ya empaquetado por Vite.
setWorkerUrl(maplibreWorkerUrl);

const COLORS = {
  base: '#5f7286',
  nearby: '#4fb3d9',
  link: '#4fb3d9',
  zone: '#f2a33a',
};

interface MapViewProps {
  bases: readonly Base[];
  draft: Coordinates | null;
  event: DispatchEvent | null;
  nearby: NearbyBase[];
  onPick: (coords: Coordinates) => void;
}

const toLngLat = (c: Coordinates): [number, number] => [c.lon, c.lat];

function zoneFeature(): Feature<Polygon> {
  const [w, s, e, n] = DEMO_ZONE_BBOX;
  return {
    type: 'Feature',
    properties: { name: DEMO_ZONE_NAME },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    },
  };
}

function basesCollection(bases: readonly Base[], nearby: NearbyBase[]): FeatureCollection<Point> {
  const nearbyIds = new Set(nearby.map((b) => b.id));
  return {
    type: 'FeatureCollection',
    features: bases.map((b) => ({
      type: 'Feature',
      properties: { id: b.id, label: b.name.replace('Base DEMO ', ''), nearby: nearbyIds.has(b.id) },
      geometry: { type: 'Point', coordinates: toLngLat(b.coordinates) },
    })),
  };
}

function linksCollection(event: DispatchEvent | null, nearby: NearbyBase[]): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: event
      ? nearby.map((b) => ({
          type: 'Feature',
          properties: { id: b.id },
          geometry: { type: 'LineString', coordinates: [toLngLat(event.coordinates), toLngLat(b.coordinates)] },
        }))
      : [],
  };
}

function markerElement(className: string): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

export function MapView({ bases, draft, event, nearby, onPick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const draftMarker = useRef<Marker | null>(null);
  const eventMarker = useRef<Marker | null>(null);
  const onPickRef = useRef(onPick);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  // Inicialización única del mapa.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE_URL,
      center: toLngLat(DEMO_ZONE_CENTER),
      zoom: 7,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;
    let loaded = false;

    // El estilo base referencia algunos iconos que su sprite no incluye; se reemplazan por
    // una imagen transparente para no ensuciar la consola.
    map.setMissingStyleImageResolver((id) => {
      if (!map.hasImage(id)) map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');
    map.addControl(new AttributionControl({ compact: false }), 'bottom-right');

    map.on('load', () => {
      map.addSource('demo-zone', { type: 'geojson', data: zoneFeature() });
      map.addSource('demo-links', { type: 'geojson', data: linksCollection(null, []) });
      map.addSource('demo-bases', { type: 'geojson', data: basesCollection([], []) });

      map.addLayer({
        id: 'demo-zone-fill',
        type: 'fill',
        source: 'demo-zone',
        paint: { 'fill-color': COLORS.zone, 'fill-opacity': 0.03 },
      });
      map.addLayer({
        id: 'demo-zone-line',
        type: 'line',
        source: 'demo-zone',
        paint: { 'line-color': COLORS.zone, 'line-opacity': 0.5, 'line-width': 1, 'line-dasharray': [4, 3] },
      });
      map.addLayer({
        id: 'demo-links',
        type: 'line',
        source: 'demo-links',
        paint: { 'line-color': COLORS.link, 'line-width': 1.5, 'line-opacity': 0.8, 'line-dasharray': [2, 2] },
      });
      map.addLayer({
        id: 'demo-bases',
        type: 'circle',
        source: 'demo-bases',
        paint: {
          'circle-radius': ['case', ['get', 'nearby'], 7, 5],
          'circle-color': ['case', ['get', 'nearby'], COLORS.nearby, COLORS.base],
          'circle-stroke-color': '#0b0e12',
          'circle-stroke-width': 2,
        },
      });
      map.addLayer({
        id: 'demo-bases-label',
        type: 'symbol',
        source: 'demo-bases',
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': ['case', ['get', 'nearby'], '#d7eef8', '#9aa8b6'],
          'text-halo-color': '#0b0e12',
          'text-halo-width': 1.4,
        },
      });

      loaded = true;
      setReady(true);
    });

    map.on('error', () => {
      // Solo se avisa si el mapa base nunca terminó de cargar (estilo o worker).
      if (!loaded) setLoadError(true);
    });

    map.on('click', (e) => onPickRef.current({ lat: e.lngLat.lat, lon: e.lngLat.lng }));

    map.on('mousemove', (e) => {
      if (cursorRef.current) {
        cursorRef.current.textContent = `${formatDecimal(e.lngLat.lat)}, ${formatDecimal(e.lngLat.lng)}`;
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Capas de bases y líneas de rumbo.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.getSource<GeoJSONSource>('demo-bases')?.setData(basesCollection(bases, nearby));
    map.getSource<GeoJSONSource>('demo-links')?.setData(linksCollection(event, nearby));
  }, [ready, bases, event, nearby]);

  // Marcador de ubicación seleccionada (borrador).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!draft) {
      draftMarker.current?.remove();
      draftMarker.current = null;
      return;
    }
    if (!draftMarker.current) {
      draftMarker.current = new Marker({ element: markerElement('marker-draft') });
    }
    draftMarker.current.setLngLat(toLngLat(draft)).addTo(map);
  }, [draft]);

  // Marcador del evento activo y encuadre del evento con sus bases cercanas.
  useEffect(() => {
    const map = mapRef.current;
    eventMarker.current?.remove();
    eventMarker.current = null;
    if (!map || !event) return;

    eventMarker.current = new Marker({ element: markerElement('marker-event') })
      .setLngLat(toLngLat(event.coordinates))
      .addTo(map);

    const bounds = new LngLatBounds(toLngLat(event.coordinates), toLngLat(event.coordinates));
    nearby.forEach((b) => bounds.extend(toLngLat(b.coordinates)));
    map.fitBounds(bounds, { padding: 80, maxZoom: 10, duration: 800 });
  }, [event, nearby]);

  return (
    <div className="map">
      <div ref={containerRef} className="map__canvas" aria-label="Mapa interactivo" role="region" />

      <div className="map__overlay map__overlay--legend">
        <p className="map__hint">Haz clic en el mapa para fijar la ubicación</p>
        <ul className="legend">
          <li>
            <span className="legend__swatch legend__swatch--event" /> Evento
          </li>
          <li>
            <span className="legend__swatch legend__swatch--draft" /> Ubicación seleccionada
          </li>
          <li>
            <span className="legend__swatch legend__swatch--nearby" /> Base DEMO cercana
          </li>
          <li>
            <span className="legend__swatch legend__swatch--base" /> Base DEMO
          </li>
          <li>
            <span className="legend__swatch legend__swatch--zone" /> {DEMO_ZONE_NAME}
          </li>
        </ul>
      </div>

      <div className="map__overlay map__overlay--cursor mono" aria-hidden="true">
        <span ref={cursorRef}>—</span>
      </div>

      {loadError && (
        <div className="map__error" role="alert">
          No se pudo cargar el mapa base. Revisa tu conexión: el formulario y los cálculos siguen funcionando.
        </div>
      )}
    </div>
  );
}
