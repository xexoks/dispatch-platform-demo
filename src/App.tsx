import { useCallback, useMemo, useState } from 'react';
import { ComingSoonCard } from './components/ComingSoonCard';
import { EventCard } from './components/EventCard';
import { EventForm } from './components/EventForm';
import { IconSignal, IconTruck, IconWind } from './components/icons';
import { TopBar } from './components/layout/TopBar';
import { MapView } from './components/MapView';
import { NearbyBasesList } from './components/NearbyBasesList';
import { DEMO_BASES } from './data/demoBases';
import { useDispatchEvent } from './hooks/useDispatchEvent';
import { formatDecimal, parseCoordinates } from './lib/geo';
import type { Coordinates } from './types/dispatch';

export default function App() {
  const { event, nearby, createEvent, clearEvent } = useDispatchEvent();
  const [latText, setLatText] = useState('');
  const [lonText, setLonText] = useState('');

  // El formulario y el mapa comparten la misma ubicación en borrador.
  const draft = useMemo(() => {
    const parsed = parseCoordinates(latText, lonText);
    if (!parsed.ok) return null;
    const sameAsEvent =
      event && event.coordinates.lat === parsed.value.lat && event.coordinates.lon === parsed.value.lon;
    return sameAsEvent ? null : parsed.value;
  }, [latText, lonText, event]);

  const handlePick = useCallback((c: Coordinates) => {
    setLatText(formatDecimal(c.lat));
    setLonText(formatDecimal(c.lon));
  }, []);

  return (
    <div className="app">
      <TopBar />

      <main className="workspace">
        <aside className="panel panel--left" aria-label="Creación y ficha del evento">
          <EventForm
            latText={latText}
            lonText={lonText}
            onLatChange={setLatText}
            onLonChange={setLonText}
            onSubmit={createEvent}
            onClear={clearEvent}
            hasEvent={event !== null}
          />
          <EventCard event={event} />
        </aside>

        <section className="workspace__map" aria-label="Mapa">
          <MapView bases={DEMO_BASES} draft={draft} event={event} nearby={nearby} onPick={handlePick} />
        </section>

        <aside className="panel panel--right" aria-label="Contexto operacional">
          <NearbyBasesList bases={nearby} />
          <ComingSoonCard
            title="Recursos"
            icon={<IconTruck />}
            description="Disponibilidad de recursos asignables por base DEMO."
          />
          <ComingSoonCard
            title="Meteorología"
            icon={<IconWind />}
            description="Viento, temperatura y humedad simulados en el punto del evento."
          />
          <ComingSoonCard
            title="Cobertura"
            icon={<IconSignal />}
            description="Cobertura de comunicaciones y zonas de sombra en el área."
          />
          <p className="disclaimer">
            Demo de portafolio. Todos los datos son ficticios y no representan instalaciones, organizaciones ni
            operaciones reales.
          </p>
        </aside>
      </main>
    </div>
  );
}
