import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../status-badge';

describe('StatusBadge', () => {
  it('renders open status', () => {
    render(<StatusBadge status="open" />);
    expect(screen.getByText('Aberto')).toBeInTheDocument();
  });

  it('renders in_progress status', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
  });

  it('renders resolved status', () => {
    render(<StatusBadge status="resolved" />);
    expect(screen.getByText('Resolvido')).toBeInTheDocument();
  });

  it('renders closed status', () => {
    render(<StatusBadge status="closed" />);
    expect(screen.getByText('Fechado')).toBeInTheDocument();
  });

  it('renders without icon when showIcon is false', () => {
    const { container } = render(<StatusBadge status="open" showIcon={false} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('renders with icon by default', () => {
    const { container } = render(<StatusBadge status="open" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
