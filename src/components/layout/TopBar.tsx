import { useEffect, useState } from 'react';
import { DEMO_ZONE_NAME } from '../../data/demoBases';
import { IconCrosshair } from '../icons';

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time className="topbar__clock mono" dateTime={now.toISOString()}>
      {now.toLocaleTimeString('es-CL', { hour12: false })}
    </time>
  );
}

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__mark">
          <IconCrosshair size={20} />
        </span>
        <div>
          <h1 className="topbar__title">Consola de Preparación de Despacho</h1>
          <p className="topbar__subtitle">{DEMO_ZONE_NAME}</p>
        </div>
      </div>
      <div className="topbar__status">
        <span className="badge badge--demo">DEMO · Datos ficticios</span>
        <span className="topbar__meta">Solo frontend · v0.1</span>
        <Clock />
      </div>
    </header>
  );
}
