import { useId, useState, type FormEvent } from 'react';
import { DEMO_ZONE_CENTER } from '../data/demoBases';
import { parseCoordinates } from '../lib/geo';
import type { NewEventInput } from '../hooks/useDispatchEvent';
import type { EventPriority, EventType } from '../types/dispatch';

const EVENT_TYPES: EventType[] = ['Incendio de vegetación', 'Emergencia vehicular', 'Rescate', 'Otro'];
const PRIORITIES: EventPriority[] = ['Alta', 'Media', 'Baja'];

interface EventFormProps {
  latText: string;
  lonText: string;
  onLatChange: (value: string) => void;
  onLonChange: (value: string) => void;
  onSubmit: (input: NewEventInput) => void;
  onClear: () => void;
  hasEvent: boolean;
}

export function EventForm({
  latText,
  lonText,
  onLatChange,
  onLonChange,
  onSubmit,
  onClear,
  hasEvent,
}: EventFormProps) {
  const ids = useId();
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('Incendio de vegetación');
  const [priority, setPriority] = useState<EventPriority>('Media');
  const [submitted, setSubmitted] = useState(false);

  const parsed = parseCoordinates(latText, lonText);
  const errors = parsed.ok ? {} : parsed.errors;
  const showLatError = Boolean(errors.lat) && (submitted || latText.trim() !== '');
  const showLonError = Boolean(errors.lon) && (submitted || lonText.trim() !== '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!parsed.ok) return;
    onSubmit({
      name: name.trim() || 'Evento DEMO sin nombre',
      type,
      priority,
      coordinates: parsed.value,
    });
    setSubmitted(false);
  };

  const handleClear = () => {
    setName('');
    setSubmitted(false);
    onLatChange('');
    onLonChange('');
    onClear();
  };

  const loadExample = () => {
    onLatChange((DEMO_ZONE_CENTER.lat - 0.12).toFixed(5));
    onLonChange((DEMO_ZONE_CENTER.lon + 0.15).toFixed(5));
    if (!name.trim()) setName('Evento DEMO de prueba');
  };

  return (
    <section className="card" aria-labelledby={`${ids}-title`}>
      <header className="card__header">
        <h2 id={`${ids}-title`} className="card__title">
          Nuevo evento
        </h2>
        <button type="button" className="btn btn--ghost btn--sm" onClick={loadExample}>
          Cargar ejemplo
        </button>
      </header>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={`${ids}-name`}>Nombre</label>
          <input
            id={`${ids}-name`}
            type="text"
            value={name}
            maxLength={80}
            placeholder="Ej.: Evento DEMO sector norte"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor={`${ids}-type`}>Tipo</label>
          <select id={`${ids}-type`} value={type} onChange={(e) => setType(e.target.value as EventType)}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="field">
          <legend>Prioridad</legend>
          <div className="segmented" role="radiogroup">
            {PRIORITIES.map((p) => (
              <label key={p} className={`segmented__item segmented__item--${p.toLowerCase()}`}>
                <input
                  type="radio"
                  name={`${ids}-priority`}
                  value={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <div className="field">
            <label htmlFor={`${ids}-lat`}>Latitud</label>
            <input
              id={`${ids}-lat`}
              className="mono"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="-34.30000"
              value={latText}
              aria-invalid={showLatError}
              aria-describedby={showLatError ? `${ids}-lat-err` : undefined}
              onChange={(e) => onLatChange(e.target.value)}
            />
            {showLatError && (
              <p id={`${ids}-lat-err`} className="field__error">
                {errors.lat}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor={`${ids}-lon`}>Longitud</label>
            <input
              id={`${ids}-lon`}
              className="mono"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="-71.20000"
              value={lonText}
              aria-invalid={showLonError}
              aria-describedby={showLonError ? `${ids}-lon-err` : undefined}
              onChange={(e) => onLonChange(e.target.value)}
            />
            {showLonError && (
              <p id={`${ids}-lon-err`} className="field__error">
                {errors.lon}
              </p>
            )}
          </div>
        </div>

        <p className="hint">Grados decimales (WGS84). También puedes hacer clic en el mapa.</p>

        <div className="form__actions">
          <button type="submit" className="btn btn--primary">
            {hasEvent ? 'Crear nuevo evento' : 'Crear evento'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleClear}>
            Limpiar
          </button>
        </div>
      </form>
    </section>
  );
}
