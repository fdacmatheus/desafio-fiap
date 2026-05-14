import { Peca } from './peca.entity';

describe('Peca', () => {
  const base = {
    sku: 'oleo-5w30',
    nome: 'Óleo 5W30',
    precoUnitario: 49.9,
    estoque: 10,
    estoqueMinimo: 5,
  };

  it('cria peça e normaliza SKU para uppercase', () => {
    const p = new Peca(base);
    expect(p.sku).toBe('OLEO-5W30');
    expect(p.ativo).toBe(true);
  });

  it('entrada incrementa estoque', () => {
    const p = new Peca(base);
    p.entrada(5);
    expect(p.estoque).toBe(15);
  });

  it('saida decrementa estoque', () => {
    const p = new Peca(base);
    p.saida(3);
    expect(p.estoque).toBe(7);
  });

  it('rejeita saida maior que estoque', () => {
    const p = new Peca(base);
    expect(() => p.saida(20)).toThrow(/insuficiente/);
  });

  it('estoqueBaixo retorna true quando <= estoqueMinimo', () => {
    const p = new Peca({ ...base, estoque: 5 });
    expect(p.estoqueBaixo).toBe(true);
  });

  it('estoqueBaixo retorna false quando > estoqueMinimo', () => {
    const p = new Peca({ ...base, estoque: 6 });
    expect(p.estoqueBaixo).toBe(false);
  });

  it('rejeita preço negativo', () => {
    expect(() => new Peca({ ...base, precoUnitario: -1 })).toThrow(/Preço/);
  });
});
