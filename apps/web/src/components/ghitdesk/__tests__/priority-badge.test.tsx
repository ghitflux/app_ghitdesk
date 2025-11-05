import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityBadge, type Priority } from '../priority-badge';

describe('PriorityBadge', () => {
  it('renders with low priority', () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText('Baixa')).toBeInTheDocument();
  });

  it('renders with medium priority', () => {
    render(<PriorityBadge priority="medium" />);
    expect(screen.getByText('Média')).toBeInTheDocument();
  });

  it('renders with high priority', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('renders with urgent priority', () => {
    render(<PriorityBadge priority="urgent" />);
    expect(screen.getByText('Urgente')).toBeInTheDocument();
  });

  it('applies correct color class for low priority', () => {
    const { container } = render(<PriorityBadge priority="low" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-default');
  });

  it('applies correct color class for medium priority', () => {
    const { container } = render(<PriorityBadge priority="medium" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-primary');
  });

  it('applies correct color class for high priority', () => {
    const { container } = render(<PriorityBadge priority="high" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-warning');
  });

  it('applies correct color class for urgent priority', () => {
    const { container } = render(<PriorityBadge priority="urgent" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-danger');
  });

  describe('Icon Rendering', () => {
    it('does not render icon for low priority', () => {
      const { container } = render(<PriorityBadge priority="low" />);
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBe(0);
    });

    it('does not render icon for medium priority', () => {
      const { container } = render(<PriorityBadge priority="medium" />);
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBe(0);
    });

    it('renders icon for high priority', () => {
      const { container } = render(<PriorityBadge priority="high" />);
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('renders icon for urgent priority', () => {
      const { container } = render(<PriorityBadge priority="urgent" />);
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('Priority Configuration', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

    it.each(priorities)('renders correctly for %s priority', (priority) => {
      const { container } = render(<PriorityBadge priority={priority} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Visual Properties', () => {
    it('renders with flat variant', () => {
      const { container } = render(<PriorityBadge priority="medium" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('data-[variant=flat]:bg-primary');
    });

    it('renders with small size', () => {
      const { container } = render(<PriorityBadge priority="medium" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('h-6');
    });
  });

  describe('Accessibility', () => {
    it('renders as a visible badge element', () => {
      const { container } = render(<PriorityBadge priority="high" />);
      expect(container.firstChild).toBeVisible();
    });

    it('contains readable text content', () => {
      render(<PriorityBadge priority="urgent" />);
      const badge = screen.getByText('Urgente');
      expect(badge.textContent).toBeTruthy();
    });

    it('icon is decorative for screen readers', () => {
      const { container } = render(<PriorityBadge priority="urgent" />);
      // Alert icon should not have aria-label since it's decorative
      const svg = container.querySelector('svg');
      expect(svg).not.toHaveAttribute('aria-label');
    });
  });
});
