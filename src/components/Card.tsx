import { memo } from 'react';
import type { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const Card = memo(({ title, children, className = '' }: CardProps) => {
  return (
    <div className={`card ${className}`}>
      {title && <h2 className="card-title">{title}</h2>}
      <div className="card-content">{children}</div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
