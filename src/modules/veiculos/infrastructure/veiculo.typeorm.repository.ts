import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo } from '../domain/veiculo.entity';
import { VeiculoRepository } from '../domain/veiculo.repository';
import { VeiculoOrmEntity } from './veiculo.orm-entity';

@Injectable()
export class VeiculoTypeOrmRepository implements VeiculoRepository {
  constructor(
    @InjectRepository(VeiculoOrmEntity)
    private readonly repo: Repository<VeiculoOrmEntity>,
  ) {}

  private toDomain(orm: VeiculoOrmEntity): Veiculo {
    return new Veiculo({
      id: orm.id,
      clienteId: orm.clienteId,
      placa: orm.placa,
      marca: orm.marca,
      modelo: orm.modelo,
      ano: orm.ano,
      criadoEm: orm.criadoEm,
      atualizadoEm: orm.atualizadoEm,
    });
  }

  private toOrm(veiculo: Veiculo): VeiculoOrmEntity {
    const orm = new VeiculoOrmEntity();
    if (veiculo.id) orm.id = veiculo.id;
    orm.clienteId = veiculo.clienteId;
    orm.placa = veiculo.placa;
    orm.marca = veiculo.marca;
    orm.modelo = veiculo.modelo;
    orm.ano = veiculo.ano;
    return orm;
  }

  async create(veiculo: Veiculo): Promise<Veiculo> {
    const saved = await this.repo.save(this.toOrm(veiculo));
    return this.toDomain(saved);
  }

  async update(veiculo: Veiculo): Promise<Veiculo> {
    const saved = await this.repo.save(this.toOrm(veiculo));
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Veiculo | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByPlaca(placa: string): Promise<Veiculo | null> {
    const orm = await this.repo.findOne({ where: { placa } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByClienteId(clienteId: string): Promise<Veiculo[]> {
    const list = await this.repo.find({ where: { clienteId } });
    return list.map((orm) => this.toDomain(orm));
  }

  async findAll(): Promise<Veiculo[]> {
    const list = await this.repo.find();
    return list.map((orm) => this.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
