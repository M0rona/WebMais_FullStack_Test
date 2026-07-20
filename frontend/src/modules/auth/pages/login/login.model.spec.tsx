import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/common/hooks/use-auth';
import { useLoginModel } from './login.model';

vi.mock('@/common/hooks/use-auth');

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('useLoginModel', () => {
  it('faz login com os dados do form e navega para /contracts em caso de sucesso', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAuth).mockReturnValue({
      login,
      isLoggingIn: false,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useLoginModel(), { wrapper });

    act(() => {
      result.current.form.setValue('email', 'admin@webmais.com');
      result.current.form.setValue('password', '123456');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(login).toHaveBeenCalledWith({ email: 'admin@webmais.com', password: '123456' });
  });

  it('não navega quando o login falha', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Credenciais inválidas'));
    vi.mocked(useAuth).mockReturnValue({
      login,
      isLoggingIn: false,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useLoginModel(), { wrapper });

    act(() => {
      result.current.form.setValue('email', 'admin@webmais.com');
      result.current.form.setValue('password', 'errada');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(login).toHaveBeenCalled();
  });
});
