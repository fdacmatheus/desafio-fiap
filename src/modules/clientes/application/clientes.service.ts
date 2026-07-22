import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cliente } from '../domain/cliente.entity';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../domain/cliente.repository';

export interface CreateClienteInput {
  nome: string;
  documento: string;
  email?: string;
  telefone?: string;
}

export type UpdateClienteInput = Partial<CreateClienteInput>;

@Injectable()
export class ClientesService {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly repository: ClienteRepository) {}

  async create(input: CreateClienteInput): Promise<Cliente> {
    const cliente = new Cliente(input);
    const existing = await this.repository.findByDocumento(cliente.documento);
    if (existing) {
      throw new ConflictException('Já existe um cliente com este documento');
    }
    return this.repository.create(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Cliente> {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return cliente;
  }

  async update(id: string, input: UpdateClienteInput): Promise<Cliente> {
    const cliente = await this.findById(id);
    const updated = new Cliente({
      id: cliente.id,
      nome: input.nome ?? cliente.nome,
      documento: input.documento ?? cliente.documento,
      email: input.email ?? cliente.email,
      telefone: input.telefone ?? cliente.telefone,
      criadoEm: cliente.criadoEm,
      atualizadoEm: new Date(),
    });
    return this.repository.update(updated);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
