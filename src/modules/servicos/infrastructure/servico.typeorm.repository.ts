import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servico } from '../domain/servico.entity';
import { ServicoRepository } from '../domain/servico.repository';
import { ServicoOrmEntity } from './servico.orm-entity';

@Injectable()
export class ServicoTypeOrmRepository implements ServicoRepository {
  constructor(
    @InjectRepository(ServicoOrmEntity)
    private readonly repo: Repository<ServicoOrmEntity>,
  ) {}

  private toDomain(orm: ServicoOrmEntity): Servico {
    return new Servico({
      id: orm.id,
      nome: orm.nome,
      descricao: orm.descricao,
      preco: Number(orm.preco),
      duracaoEstimadaMinutos: orm.duracaoEstimadaMinutos,
      ativo: orm.ativo,
      criadoEm: orm.criadoEm,
      atualizadoEm: orm.atualizadoEm,
    });
  }

  private toOrm(servico: Servico): ServicoOrmEntity {
    const orm = new ServicoOrmEntity();
    if (servico.id) orm.id = servico.id;
    orm.nome = servico.nome;
    orm.descricao = servico.descricao;
    orm.preco = servico.preco.toFixed(2);
    orm.duracaoEstimadaMinutos = servico.duracaoEstimadaMinutos;
    orm.ativo = servico.ativo;
    return orm;
  }

  async create(servico: Servico): Promise<Servico> {
    const saved = await this.repo.save(this.toOrm(servico));
    return this.toDomain(saved);
  }

  async update(servico: Servico): Promise<Servico> {
    const saved = await this.repo.save(this.toOrm(servico));
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Servico | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(includeInativos = false): Promise<Servico[]> {
    const list = await this.repo.find(includeInativos ? undefined : { where: { ativo: true } });
    return list.map((orm) => this.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
