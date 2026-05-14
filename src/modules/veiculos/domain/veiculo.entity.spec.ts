import { Veiculo } from './veiculo.entity';

describe('Veiculo', () => {
  const base = {
    clienteId: '550e8400-e29b-41d4-a716-446655440000',
    placa: 'ABC1D23',
    marca: 'VW',
    modelo: 'Gol',
    ano: 2020,
  };

  it('cria veículo válido e normaliza placa para uppercase', () => {
    const v = new Veiculo({ ...base, placa: 'abc1d23' });
    expect(v.placa).toBe('ABC1D23');
  });

  it('normaliza placa antiga removendo hífen', () => {
    const v = new Veiculo({ ...base, placa: 'ABC-1234' });
    expect(v.placa).toBe('ABC1234');
  });

  it('rejeita placa inválida', () => {
    expect(() => new Veiculo({ ...base, placa: '12345' })).toThrow(/Placa/);
  });

  it('rejeita ano fora do range', () => {
    expect(() => new Veiculo({ ...base, ano: 1800 })).toThrow(/Ano/);
    expect(() => new Veiculo({ ...base, ano: 3000 })).toThrow(/Ano/);
  });

  it('rejeita sem clienteId', () => {
    expect(() => new Veiculo({ ...base, clienteId: '' })).toThrow(/clienteId/);
  });
});
