import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DashboardPage from '../page';
import { useAuth } from '@/context/auth-context';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock Auth context
vi.mock('@/context/auth-context', () => ({
  useAuth: vi.fn(),
}));

describe('DashboardPage', () => {
  const mockPush = vi.fn();
  const mockLogout = vi.fn();

  const mockUser = {
    id: '123',
    name: 'João Silva',
    email: 'joao@ghitdesk.com',
    role: 'AGENT' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useAuth as any).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  it('renders dashboard heading', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo ao GhitDesk!')).toBeInTheDocument();
  });

  it('renders user information card', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Informações do Usuário')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@ghitdesk.com')).toBeInTheDocument();
    expect(screen.getByText('AGENT')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<DashboardPage />);

    const logoutButton = screen.getByRole('button', { name: /sair/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('displays user name from context', () => {
    render(<DashboardPage />);

    expect(screen.getByText(/joão silva/i)).toBeInTheDocument();
  });

  it('displays user email from context', () => {
    render(<DashboardPage />);

    expect(screen.getByText(/joao@ghitdesk.com/i)).toBeInTheDocument();
  });

  it('displays user role from context', () => {
    render(<DashboardPage />);

    expect(screen.getByText(/agent/i)).toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', async () => {
    mockLogout.mockResolvedValue(undefined);
    render(<DashboardPage />);

    const logoutButton = screen.getByRole('button', { name: /sair/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('redirects to login page after logout', async () => {
    mockLogout.mockResolvedValue(undefined);
    render(<DashboardPage />);

    const logoutButton = screen.getByRole('button', { name: /sair/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('renders completion status card', () => {
    render(<DashboardPage />);

    expect(screen.getByText(/ETAPA 3 Completa!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Backend FastAPI \+ Auth JWT \+ PostgreSQL está funcionando!/i)
    ).toBeInTheDocument();
  });

  describe('Feature Checklist', () => {
    it('renders FastAPI singleton pattern item', () => {
      render(<DashboardPage />);

      expect(
        screen.getByText(/FastAPI com padrões Singleton/i)
      ).toBeInTheDocument();
    });

    it('renders SQLAlchemy model item', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/SQLAlchemy User model/i)).toBeInTheDocument();
    });

    it('renders repository pattern item', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/Repository Pattern/i)).toBeInTheDocument();
    });

    it('renders auth JWT item', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/Auth JWT \(login, logout\)/i)).toBeInTheDocument();
    });

    it('renders BFF route handlers item', () => {
      render(<DashboardPage />);

      expect(
        screen.getByText(/BFF Route Handlers no Next.js/i)
      ).toBeInTheDocument();
    });

    it('renders AuthContext item', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/AuthContext e middleware/i)).toBeInTheDocument();
    });

    it('renders login page item', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/Página de login funcional/i)).toBeInTheDocument();
    });
  });

  describe('Different User Roles', () => {
    it('renders correctly for ADMIN role', () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, role: 'ADMIN' },
        logout: mockLogout,
      });

      render(<DashboardPage />);

      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    it('renders correctly for SUPERVISOR role', () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, role: 'SUPERVISOR' },
        logout: mockLogout,
      });

      render(<DashboardPage />);

      expect(screen.getByText('SUPERVISOR')).toBeInTheDocument();
    });

    it('renders correctly for AGENT role', () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, role: 'AGENT' },
        logout: mockLogout,
      });

      render(<DashboardPage />);

      expect(screen.getByText('AGENT')).toBeInTheDocument();
    });
  });

  describe('User with Different Data', () => {
    it('renders with different user name', () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, name: 'Maria Santos' },
        logout: mockLogout,
      });

      render(<DashboardPage />);

      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });

    it('renders with different user email', () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, email: 'maria@ghitdesk.com' },
        logout: mockLogout,
      });

      render(<DashboardPage />);

      expect(screen.getByText('maria@ghitdesk.com')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('renders logout button with icon', () => {
      const { container } = render(<DashboardPage />);

      const logoutButton = screen.getByRole('button', { name: /sair/i });
      expect(logoutButton).toBeInTheDocument();

      // Check for LogOut icon
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('logout button has danger color', () => {
      render(<DashboardPage />);

      const logoutButton = screen.getByRole('button', { name: /sair/i });
      expect(logoutButton).toHaveClass('bg-danger');
    });

    it('renders multiple cards', () => {
      const { container } = render(<DashboardPage />);

      const cards = container.querySelectorAll('[class*="bg-content1"]');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('renders dividers in cards', () => {
      const { container } = render(<DashboardPage />);

      const dividers = container.querySelectorAll('[role="separator"]');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Structure', () => {
    it('renders container with proper spacing', () => {
      const { container } = render(<DashboardPage />);

      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('mx-auto', 'p-8', 'space-y-6');
    });

    it('renders header with flex layout', () => {
      const { container } = render(<DashboardPage />);

      const header = container.querySelector('.flex.justify-between');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<DashboardPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Dashboard');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('logout button is accessible', () => {
      render(<DashboardPage />);

      const logoutButton = screen.getByRole('button', { name: /sair/i });
      expect(logoutButton).toBeVisible();
      expect(logoutButton).toBeEnabled();
    });

    it('displays user information with proper labels', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/nome:/i)).toBeInTheDocument();
      expect(screen.getByText(/email:/i)).toBeInTheDocument();
      expect(screen.getByText(/role:/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing user gracefully', () => {
      (useAuth as any).mockReturnValue({
        user: null,
        logout: mockLogout,
      });

      render(<DashboardPage />);

      // Page should still render, but user info will be empty
      expect(screen.getByText('Informações do Usuário')).toBeInTheDocument();
    });

    it('handles logout error gracefully', async () => {
      mockLogout.mockRejectedValue(new Error('Logout failed'));
      render(<DashboardPage />);

      const logoutButton = screen.getByRole('button', { name: /sair/i });
      fireEvent.click(logoutButton);

      // Should still attempt to redirect even if logout fails
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });

  describe('Integration', () => {
    it('renders complete dashboard with all sections', () => {
      render(<DashboardPage />);

      // Header section
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();

      // User info section
      expect(screen.getByText('Informações do Usuário')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();

      // Status section
      expect(screen.getByText(/ETAPA 3 Completa!/i)).toBeInTheDocument();

      // Logout button
      expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();
    });
  });
});
