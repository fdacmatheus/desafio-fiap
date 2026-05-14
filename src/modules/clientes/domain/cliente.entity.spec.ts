import { Cliente } from './cliente.entity';

describe('Cliente', () => {
  it('cria cliente com CPF válido e identifica tipoDocumento como CPF', () => {
    const c = new Cliente({ nome: 'João', documento: '529.982.247-25' });
    expect(c.nome).toBe('João');
    expect(c.documento).toBe('52998224725');
    expect(c.tipoDocumento).toBe('CPF');
  });

  it('cria cliente com CNPJ válido', () => {
    const c = new Cliente({ nome: 'Empresa LTDA', documento: '11.222.333/0001-81' });
    expect(c.documento).toBe('11222333000181');
    expect(c.tipoDocumento).toBe('CNPJ');
  });

  it('rejeita CPF inválido', () => {
    expect(() => new Cliente({ nome: 'João', documento: '111.111.111-11' })).toThrow(
      /Documento/,
    );
  });

  it('rejeita nome vazio', () => {
    expect(() => new Cliente({ nome: '', documento: '52998224725' })).toThrow(/Nome/);
  });
});
