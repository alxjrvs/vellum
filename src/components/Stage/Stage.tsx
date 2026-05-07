import type { ReactNode } from 'react';
import './Stage.css';

interface StageProps {
  children: ReactNode;
}

export function Stage({ children }: StageProps) {
  return <div className="vellum-stage">{children}</div>;
}
