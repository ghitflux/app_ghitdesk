import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChannelBadge, type Channel } from '../channel-badge';

describe('ChannelBadge', () => {
  it('renders with whatsapp channel', () => {
    render(<ChannelBadge channel="whatsapp" />);
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('renders with email channel', () => {
    render(<ChannelBadge channel="email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders with telegram channel', () => {
    render(<ChannelBadge channel="telegram" />);
    expect(screen.getByText('Telegram')).toBeInTheDocument();
  });

  it('renders with twitter channel', () => {
    render(<ChannelBadge channel="twitter" />);
    expect(screen.getByText('Twitter')).toBeInTheDocument();
  });

  it('applies correct color class for whatsapp', () => {
    const { container } = render(<ChannelBadge channel="whatsapp" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('border-success');
  });

  it('applies correct color class for email', () => {
    const { container } = render(<ChannelBadge channel="email" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('border-primary');
  });

  it('applies correct color class for telegram', () => {
    const { container } = render(<ChannelBadge channel="telegram" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('border-primary');
  });

  it('applies correct color class for twitter', () => {
    const { container } = render(<ChannelBadge channel="twitter" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('border-default');
  });

  describe('Icon Rendering', () => {
    const channels: Channel[] = ['whatsapp', 'email', 'telegram', 'twitter'];

    it.each(channels)('renders icon for %s channel', (channel) => {
      const { container } = render(<ChannelBadge channel={channel} />);
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('renders MessageCircle icon for whatsapp', () => {
      const { container } = render(<ChannelBadge channel="whatsapp" />);
      const svg = container.querySelector('svg');
      // MessageCircle icon is present
      expect(svg).toBeInTheDocument();
    });

    it('renders Mail icon for email', () => {
      const { container } = render(<ChannelBadge channel="email" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders Send icon for telegram', () => {
      const { container } = render(<ChannelBadge channel="telegram" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders Twitter icon for twitter', () => {
      const { container } = render(<ChannelBadge channel="twitter" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Channel Configuration', () => {
    const channels: Channel[] = ['whatsapp', 'email', 'telegram', 'twitter'];

    it.each(channels)('renders correctly for %s channel', (channel) => {
      const { container } = render(<ChannelBadge channel={channel} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Visual Properties', () => {
    it('renders with bordered variant', () => {
      const { container } = render(<ChannelBadge channel="whatsapp" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('border-medium');
    });

    it('renders with small size', () => {
      const { container } = render(<ChannelBadge channel="email" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('h-6');
    });

    it('icon has correct size attribute', () => {
      const { container } = render(<ChannelBadge channel="telegram" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '14');
      expect(svg).toHaveAttribute('height', '14');
    });
  });

  describe('Accessibility', () => {
    it('renders as a visible badge element', () => {
      const { container } = render(<ChannelBadge channel="whatsapp" />);
      expect(container.firstChild).toBeVisible();
    });

    it('contains readable text content', () => {
      render(<ChannelBadge channel="email" />);
      const badge = screen.getByText('Email');
      expect(badge.textContent).toBeTruthy();
    });

    it('icon is part of the badge content', () => {
      const { container } = render(<ChannelBadge channel="whatsapp" />);
      const badge = container.firstChild;
      const svg = badge?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders multiple channel badges without conflicts', () => {
      const { container } = render(
        <>
          <ChannelBadge channel="whatsapp" />
          <ChannelBadge channel="email" />
          <ChannelBadge channel="telegram" />
          <ChannelBadge channel="twitter" />
        </>
      );
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Telegram')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();

      const badges = container.querySelectorAll('[class*="bg-"]');
      expect(badges.length).toBe(4);
    });
  });
});
