import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/modules/auth/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { useRegisterModel } from './register.model';

vi.mock('@/modules/auth/services/auth.service', () => ({
  authService: {
    register: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('useRegisterModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    vi.mocked(useNavigate).mockReturnValue(vi.fn());
  });

  it('cadastra o usuário, autentica e navega para /contracts em caso de sucesso', async () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(authService.register).mockResolvedValue({
      accessToken: 'token-123',
      user: { id: '1', name: 'Fulano', email: 'fulano@webmais.com' },
    });

    const { result } = renderHook(() => useRegisterModel(), { wrapper });

    act(() => {
      result.current.form.setValue('name', 'Fulano');
      result.current.form.setValue('email', 'fulano@webmais.com');
      result.current.form.setValue('password', '123456');
      result.current.form.setValue('confirmPassword', '123456');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Fulano',
        email: 'fulano@webmais.com',
        password: '123456',
      });
    });
    expect(useAuthStore.getState().token).toBe('token-123');
    expect(navigate).toHaveBeenCalledWith('/contracts');
  });

  it('não autentica nem navega quando o cadastro falha', async () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(authService.register).mockRejectedValue(new Error('Email já cadastrado'));

    const { result } = renderHook(() => useRegisterModel(), { wrapper });

    act(() => {
      result.current.form.setValue('name', 'Fulano');
      result.current.form.setValue('email', 'fulano@webmais.com');
      result.current.form.setValue('password', '123456');
      result.current.form.setValue('confirmPassword', '123456');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
    expect(useAuthStore.getState().token).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });
});
