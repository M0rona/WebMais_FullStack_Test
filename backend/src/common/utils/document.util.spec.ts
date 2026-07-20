import { isValidCpfOrCnpj } from './document.util';

describe('isValidCpfOrCnpj', () => {
  it('aceita CPF válido', () => {
    expect(isValidCpfOrCnpj('52998224725')).toBe(true);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(isValidCpfOrCnpj('52998224700')).toBe(false);
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(isValidCpfOrCnpj('11111111111')).toBe(false);
  });

  it('aceita CNPJ válido', () => {
    expect(isValidCpfOrCnpj('11444777000161')).toBe(true);
  });

  it('rejeita CNPJ com dígito verificador errado', () => {
    expect(isValidCpfOrCnpj('11444777000100')).toBe(false);
  });

  it('rejeita tamanho inválido', () => {
    expect(isValidCpfOrCnpj('123')).toBe(false);
  });
});
