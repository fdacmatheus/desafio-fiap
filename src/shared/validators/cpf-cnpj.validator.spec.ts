import { isValidCnpj, isValidCpf } from './cpf-cnpj.validator';

describe('isValidCpf', () => {
  it.each(['529.982.247-25', '52998224725', '111.444.777-35'])(
    'aceita CPF válido %s',
    (cpf) => {
      expect(isValidCpf(cpf)).toBe(true);
    },
  );

  it.each(['111.111.111-11', '123.456.789-00', '12345678900', ''])(
    'rejeita CPF inválido %s',
    (cpf) => {
      expect(isValidCpf(cpf)).toBe(false);
    },
  );
});

describe('isValidCnpj', () => {
  it.each(['11.222.333/0001-81', '11222333000181'])('aceita CNPJ válido %s', (cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(true);
  });

  it.each(['11.111.111/1111-11', '11.222.333/0001-00', ''])(
    'rejeita CNPJ inválido %s',
    (cnpj) => {
      expect(isValidCnpj(cnpj)).toBe(false);
    },
  );
});
