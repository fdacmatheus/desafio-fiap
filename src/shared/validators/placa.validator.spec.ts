import { isValidPlaca } from './placa.validator';

describe('isValidPlaca', () => {
  it.each(['ABC1D23', 'ABC-1234', 'ABC1234', 'abc1d23'])('aceita placa válida %s', (placa) => {
    expect(isValidPlaca(placa)).toBe(true);
  });

  it.each(['AB1C234', '12345', 'ABCD1234', ''])('rejeita placa inválida %s', (placa) => {
    expect(isValidPlaca(placa)).toBe(false);
  });
});
