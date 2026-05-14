import { Servico } from './servico.entity';

export const SERVICO_REPOSITORY = Symbol('SERVICO_REPOSITORY');

export interface ServicoRepository {
  create(servico: Servico): Promise<Servico>;
  update(servico: Servico): Promise<Servico>;
  findById(id: string): Promise<Servico | null>;
  findAll(includeInativos?: boolean): Promise<Servico[]>;
  delete(id: string): Promise<void>;
}
