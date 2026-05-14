import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../domain/cliente.entity';
import { ClienteRepository } from '../domain/cliente.repository';
import { ClienteOrmEntity } from './cliente.orm-entity';

@Injectable()
export class ClienteTypeOrmRepository implements ClienteRepository {
  constructor(
    @InjectRepository(ClienteOrmEntity)
    private readonly repo: Repository<ClienteOrmEntity>,
  ) {}

  private toDomain(orm: ClienteOrmEntity): Cliente {
    return new Cliente({
      id: orm.id,
      nome: orm.nome,
      documento: orm.documento,
      email: orm.email,
      telefone: orm.telefone,
      criadoEm: orm.criadoEm,
      atualizadoEm: orm.atualizadoEm,
    });
  }

  private toOrm(cliente: Cliente): ClienteOrmEntity {
    const orm = new ClienteOrmEntity();
    if (cliente.id) orm.id = cliente.id;
    orm.nome = cliente.nome;
    orm.documento = cliente.documento;
    orm.email = cliente.email;
    orm.telefone = cliente.telefone;
    return orm;
  }

  async create(cliente: Cliente): Promise<Cliente> {
    const saved = await this.repo.save(this.toOrm(cliente));
    return this.toDomain(saved);
  }

  async update(cliente: Cliente): Promise<Cliente> {
    const saved = await this.repo.save(this.toOrm(cliente));
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Cliente | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByDocumento(documento: string): Promise<Cliente | null> {
    const orm = await this.repo.findOne({ where: { documento } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<Cliente[]> {
    const list = await this.repo.find();
    return list.map((orm) => this.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
