import type { NearbyBase } from '../types/dispatch';
import { IconArrow, IconBase } from './icons';

interface NearbyBasesListProps {
  bases: NearbyBase[];
}

const km = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function NearbyBasesList({ bases }: NearbyBasesListProps) {
  return (
    <section className="card" aria-label="Bases cercanas">
      <header className="card__header">
        <h2 className="card__title">Bases cercanas</h2>
        <span className="badge badge--demo">DEMO</span>
      </header>

      {bases.length === 0 ? (
        <div className="empty">
          <IconBase size={22} />
          <p>Crea un evento para calcular las 4 bases DEMO más cercanas.</p>
        </div>
      ) : (
        <>
          <ol className="bases">
            {bases.map((b, i) => (
              <li key={b.id} className="bases__item">
                <span className="bases__rank mono">{i + 1}</span>
                <div className="bases__info">
                  <span className="bases__name">{b.name}</span>
                  <span className="bases__id mono">{b.id}</span>
                </div>
                <div className="bases__metrics mono">
                  <span className="bases__distance">{km.format(b.distanceKm)} km</span>
                  <span className="bases__bearing" title={`Rumbo ${b.bearingDeg.toFixed(1)}°`}>
                    <IconArrow size={12} style={{ transform: `rotate(${b.bearingDeg}deg)` }} />
                    {Math.round(b.bearingDeg).toString().padStart(3, '0')}° {b.cardinal}
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <p className="hint">Distancia en línea recta y rumbo inicial desde el evento. No considera rutas.</p>
        </>
      )}
    </section>
  );
}
