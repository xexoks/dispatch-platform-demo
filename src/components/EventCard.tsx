import { useState } from 'react';
import { formatDecimal, toDMS } from '../lib/geo';
import type { DispatchEvent } from '../types/dispatch';
import { IconCopy, IconPin } from './icons';

interface EventCardProps {
  event: DispatchEvent | null;
}

export function EventCard({ event }: EventCardProps) {
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <section className="card" aria-label="Ficha del evento">
        <header className="card__header">
          <h2 className="card__title">Ficha del evento</h2>
        </header>
        <div className="empty">
          <IconPin size={22} />
          <p>Sin evento activo. Completa el formulario o selecciona un punto en el mapa.</p>
        </div>
      </section>
    );
  }

  const { lat, lon } = event.coordinates;
  const decimal = `${formatDecimal(lat)}, ${formatDecimal(lon)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(decimal);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // El portapapeles puede no estar disponible (contexto no seguro); se ignora.
    }
  };

  return (
    <section className="card card--event" aria-label="Ficha del evento">
      <header className="card__header">
        <h2 className="card__title">Ficha del evento</h2>
        <span className={`badge badge--prio-${event.priority.toLowerCase()}`}>Prioridad {event.priority}</span>
      </header>

      <p className="event__id mono">{event.id}</p>
      <p className="event__name">{event.name}</p>

      <dl className="kv">
        <div>
          <dt>Tipo</dt>
          <dd>{event.type}</dd>
        </div>
        <div>
          <dt>Creado</dt>
          <dd className="mono">
            {event.createdAt.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'medium', hour12: false })}
          </dd>
        </div>
        <div>
          <dt>Latitud</dt>
          <dd className="mono">
            {formatDecimal(lat)}
            <span className="kv__sub">{toDMS(lat, 'lat')}</span>
          </dd>
        </div>
        <div>
          <dt>Longitud</dt>
          <dd className="mono">
            {formatDecimal(lon)}
            <span className="kv__sub">{toDMS(lon, 'lon')}</span>
          </dd>
        </div>
      </dl>

      <button type="button" className="btn btn--ghost btn--sm btn--block" onClick={copy}>
        <IconCopy size={14} />
        {copied ? 'Coordenadas copiadas' : 'Copiar coordenadas'}
      </button>
    </section>
  );
}
