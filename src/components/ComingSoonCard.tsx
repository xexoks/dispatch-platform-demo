import type { ReactNode } from 'react';

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function ComingSoonCard({ title, description, icon }: ComingSoonCardProps) {
  return (
    <section className="card card--soon" aria-label={`${title} (próximamente)`}>
      <header className="card__header">
        <h2 className="card__title card__title--icon">
          {icon}
          {title}
        </h2>
        <span className="badge badge--soon">Próximamente</span>
      </header>
      <p className="soon__desc">{description}</p>
      <div className="soon__skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
