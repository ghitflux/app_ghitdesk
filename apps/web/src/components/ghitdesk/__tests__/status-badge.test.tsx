import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, type Status } from '../status-badge';

describe('StatusBadge', () => {
  it('renders with open status', () => {
    render(<StatusBadge status="open" />);
    expect(screen.getByText('Aberto')).toBeInTheDocument();
  });

  it('renders with in_progress status', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('Em Andamento')).toBeInTheDocument();
  });

  it('renders with resolved status', () => {
    render(<StatusBadge status="resolved" />);
    expect(screen.getByText('Resolvido')).toBeInTheDocument();
  });

  it('renders with closed status', () => {
    render(<StatusBadge status="closed" />);
    expect(screen.getByText('Fechado')).toBeInTheDocument();
  });

  it('applies correct color class for open status', () => {
    const { container } = render(<StatusBadge status="open" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-primary');
  });

  it('applies correct color class for in_progress status', () => {
    const { container } = render(<StatusBadge status="in_progress" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-warning');
  });

  it('applies correct color class for resolved status', () => {
    const { container } = render(<StatusBadge status="resolved" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-success');
  });

  it('applies correct color class for closed status', () => {
    const { container } = render(<StatusBadge status="closed" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-default');
  });

  it('renders with flat variant', () => {
    const { container } = render(<StatusBadge status="open" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('data-[variant=flat]:bg-primary');
  });

  it('renders with small size', () => {
    const { container } = render(<StatusBadge status="open" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('h-6');
  });

  describe('Status Configuration', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed'];

    it.each(statuses)('renders correctly for %s status', (status) => {
      const { container } = render(<StatusBadge status={status} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders as a visible badge element', () => {
      const { container } = render(<StatusBadge status="open" />);
      expect(container.firstChild).toBeVisible();
    });

    it('contains readable text content', () => {
      render(<StatusBadge status="in_progress" />);
      const badge = screen.getByText('Em Andamento');
      expect(badge.textContent).toBeTruthy();
    });
  });
});
