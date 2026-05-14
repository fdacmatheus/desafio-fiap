import { Cliente } from './cliente.entity';

export const CLIENTE_REPOSITORY = Symbol('CLIENTE_REPOSITORY');

export interface ClienteRepository {
  create(cliente: Cliente): Promise<Cliente>;
  update(cliente: Cliente): Promise<Cliente>;
  findById(id: string): Promise<Cliente | null>;
  findByDocumento(documento: string): Promise<Cliente | null>;
  findAll(): Promise<Cliente[]>;
  delete(id: string): Promise<void>;
}
