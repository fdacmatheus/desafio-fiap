import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Peca } from '../domain/peca.entity';
import { PecaRepository } from '../domain/peca.repository';
import { PecaOrmEntity } from './peca.orm-entity';

@Injectable()
export class PecaTypeOrmRepository implements PecaRepository {
  constructor(
    @InjectRepository(PecaOrmEntity)
    private readonly repo: Repository<PecaOrmEntity>,
  ) {}

  private toDomain(orm: PecaOrmEntity): Peca {
    return new Peca({
      id: orm.id,
      sku: orm.sku,
      nome: orm.nome,
      descricao: orm.descricao,
      precoUnitario: Number(orm.precoUnitario),
      estoque: orm.estoque,
      estoqueMinimo: orm.estoqueMinimo,
      ativo: orm.ativo,
      criadoEm: orm.criadoEm,
      atualizadoEm: orm.atualizadoEm,
    });
  }

  private toOrm(peca: Peca): PecaOrmEntity {
    const orm = new PecaOrmEntity();
    if (peca.id) orm.id = peca.id;
    orm.sku = peca.sku;
    orm.nome = peca.nome;
    orm.descricao = peca.descricao;
    orm.precoUnitario = peca.precoUnitario.toFixed(2);
    orm.estoque = peca.estoque;
    orm.estoqueMinimo = peca.estoqueMinimo;
    orm.ativo = peca.ativo;
    return orm;
  }

  async create(peca: Peca): Promise<Peca> {
    const saved = await this.repo.save(this.toOrm(peca));
    return this.toDomain(saved);
  }

  async update(peca: Peca): Promise<Peca> {
    const saved = await this.repo.save(this.toOrm(peca));
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Peca | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findBySku(sku: string): Promise<Peca | null> {
    const orm = await this.repo.findOne({ where: { sku: sku.toUpperCase() } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(includeInativas = false): Promise<Peca[]> {
    const list = await this.repo.find(includeInativas ? undefined : { where: { ativo: true } });
    return list.map((orm) => this.toDomain(orm));
  }

  async findEstoqueBaixo(): Promise<Peca[]> {
    const list = await this.repo
      .createQueryBuilder('p')
      .where('p.ativo = true')
      .andWhere('p.estoque <= p.estoque_minimo')
      .getMany();
    return list.map((orm) => this.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
