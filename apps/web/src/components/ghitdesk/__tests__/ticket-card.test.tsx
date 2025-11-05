import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketCard } from '../ticket-card';

describe('TicketCard', () => {
  const defaultProps = {
    id: 'TKT-12345',
    title: 'Bug no sistema de login',
    description: 'Usuários não conseguem fazer login após atualização',
    status: 'open' as const,
    priority: 'high' as const,
    channel: 'whatsapp' as const,
    messageCount: 5,
    createdAt: '2h atrás',
  };

  it('renders ticket id', () => {
    render(<TicketCard {...defaultProps} />);
    expect(screen.getByText('TKT-12345')).toBeInTheDocument();
  });

  it('renders ticket title', () => {
    render(<TicketCard {...defaultProps} />);
    expect(screen.getByText('Bug no sistema de login')).toBeInTheDocument();
  });

  it('renders ticket description', () => {
    render(<TicketCard {...defaultProps} />);
    expect(
      screen.getByText('Usuários não conseguem fazer login após atualização')
    ).toBeInTheDocument();
  });

  it('renders message count', () => {
    render(<TicketCard {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders creation time', () => {
    render(<TicketCard {...defaultProps} />);
    expect(screen.getByText('2h atrás')).toBeInTheDocument();
  });

  describe('Badge Components', () => {
    it('renders status badge', () => {
      render(<TicketCard {...defaultProps} />);
      expect(screen.getByText('Aberto')).toBeInTheDocument();
    });

    it('renders priority badge', () => {
      render(<TicketCard {...defaultProps} />);
      expect(screen.getByText('Alta')).toBeInTheDocument();
    });

    it('renders channel badge', () => {
      render(<TicketCard {...defaultProps} />);
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    });
  });

  describe('Optional Properties', () => {
    it('renders without assignee', () => {
      render(<TicketCard {...defaultProps} />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders with assignee', () => {
      render(
        <TicketCard
          {...defaultProps}
          assignee={{ name: 'João Silva', avatar: 'https://example.com/avatar.jpg' }}
        />
      );
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('renders without SLA remaining', () => {
      render(<TicketCard {...defaultProps} />);
      // Clock icon should not be present when no SLA
      const clockIcons = screen.queryAllByTestId('clock-icon');
      expect(clockIcons.length).toBe(0);
    });

    it('renders with SLA remaining', () => {
      render(<TicketCard {...defaultProps} slaRemaining="2h 30m" />);
      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });
  });

  describe('Different Status Values', () => {
    it('renders with in_progress status', () => {
      render(<TicketCard {...defaultProps} status="in_progress" />);
      expect(screen.getByText('Em Andamento')).toBeInTheDocument();
    });

    it('renders with resolved status', () => {
      render(<TicketCard {...defaultProps} status="resolved" />);
      expect(screen.getByText('Resolvido')).toBeInTheDocument();
    });

    it('renders with closed status', () => {
      render(<TicketCard {...defaultProps} status="closed" />);
      expect(screen.getByText('Fechado')).toBeInTheDocument();
    });
  });

  describe('Different Priority Values', () => {
    it('renders with low priority', () => {
      render(<TicketCard {...defaultProps} priority="low" />);
      expect(screen.getByText('Baixa')).toBeInTheDocument();
    });

    it('renders with medium priority', () => {
      render(<TicketCard {...defaultProps} priority="medium" />);
      expect(screen.getByText('Média')).toBeInTheDocument();
    });

    it('renders with urgent priority', () => {
      render(<TicketCard {...defaultProps} priority="urgent" />);
      expect(screen.getByText('Urgente')).toBeInTheDocument();
    });
  });

  describe('Different Channel Values', () => {
    it('renders with email channel', () => {
      render(<TicketCard {...defaultProps} channel="email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders with telegram channel', () => {
      render(<TicketCard {...defaultProps} channel="telegram" />);
      expect(screen.getByText('Telegram')).toBeInTheDocument();
    });

    it('renders with twitter channel', () => {
      render(<TicketCard {...defaultProps} channel="twitter" />);
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });
  });

  describe('Visual Structure', () => {
    it('renders as a Card component', () => {
      const { container } = render(<TicketCard {...defaultProps} />);
      const card = container.querySelector('[class*="bg-content1"]');
      expect(card).toBeInTheDocument();
    });

    it('has hover effect class', () => {
      const { container } = render(<TicketCard {...defaultProps} />);
      const card = container.querySelector('.hover\\:bg-default-100');
      expect(card).toBeInTheDocument();
    });

    it('has cursor pointer', () => {
      const { container } = render(<TicketCard {...defaultProps} />);
      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });

    it('renders ticket ID with monospace font', () => {
      const { container } = render(<TicketCard {...defaultProps} />);
      const ticketId = container.querySelector('.font-mono');
      expect(ticketId).toHaveTextContent('TKT-12345');
    });
  });

  describe('Icons', () => {
    it('renders message icon', () => {
      const { container } = render(<TicketCard {...defaultProps} />);
      const svgElements = container.querySelectorAll('svg');
      // Should have at least message icon and channel icon
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('renders clock icon when SLA is present', () => {
      const { container } = render(
        <TicketCard {...defaultProps} slaRemaining="1h" />
      );
      // Check for Clock icon specifically
      expect(screen.getByText('1h')).toBeInTheDocument();
    });
  });

  describe('Assignee Avatar', () => {
    it('renders avatar with name initials when no image', () => {
      render(
        <TicketCard {...defaultProps} assignee={{ name: 'João Silva' }} />
      );
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('renders avatar with image when provided', () => {
      render(
        <TicketCard
          {...defaultProps}
          assignee={{
            name: 'João Silva',
            avatar: 'https://example.com/avatar.jpg',
          }}
        />
      );
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  describe('Accessibility', () => {
    it('renders with semantic HTML structure', () => {
      const { container } = render(<TicketCard {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('title is rendered as heading', () => {
      render(<TicketCard {...defaultProps} />);
      const heading = screen.getByRole('heading', {
        name: 'Bug no sistema de login',
      });
      expect(heading).toBeInTheDocument();
    });

    it('has accessible text content for message count', () => {
      render(<TicketCard {...defaultProps} messageCount={10} />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('Integration Test', () => {
    it('renders complete ticket with all optional fields', () => {
      render(
        <TicketCard
          {...defaultProps}
          slaRemaining="3h 15m"
          assignee={{ name: 'Maria Santos', avatar: 'https://example.com/maria.jpg' }}
        />
      );

      expect(screen.getByText('TKT-12345')).toBeInTheDocument();
      expect(screen.getByText('Bug no sistema de login')).toBeInTheDocument();
      expect(screen.getByText('Aberto')).toBeInTheDocument();
      expect(screen.getByText('Alta')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3h 15m')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('2h atrás')).toBeInTheDocument();
    });

    it('renders minimal ticket without optional fields', () => {
      render(<TicketCard {...defaultProps} />);

      expect(screen.getByText('TKT-12345')).toBeInTheDocument();
      expect(screen.getByText('Bug no sistema de login')).toBeInTheDocument();
      expect(screen.getByText('Aberto')).toBeInTheDocument();
      expect(screen.getByText('Alta')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2h atrás')).toBeInTheDocument();
      expect(screen.queryByText(/h.*m/)).not.toBeInTheDocument(); // No SLA
    });
  });
});
