import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdemServico } from '../domain/ordem-servico.entity';
import { OrdemServicoRepository } from '../domain/ordem-servico.repository';
import { StatusOS } from '../domain/status-os';
import { ItemOSOrmEntity } from './item-os.orm-entity';
import { OrdemServicoOrmEntity } from './ordem-servico.orm-entity';

@Injectable()
export class OrdemServicoTypeOrmRepository implements OrdemServicoRepository {
  constructor(
    @InjectRepository(OrdemServicoOrmEntity)
    private readonly repo: Repository<OrdemServicoOrmEntity>,
  ) {}

  private toDomain(orm: OrdemServicoOrmEntity): OrdemServico {
    return new OrdemServico({
      id: orm.id,
      numero: orm.numero,
      clienteId: orm.clienteId,
      veiculoId: orm.veiculoId,
      status: orm.status,
      diagnostico: orm.diagnostico,
      itens: (orm.itens ?? []).map((i) => ({
        id: i.id,
        tipo: i.tipo,
        referenciaId: i.referenciaId,
        descricao: i.descricao,
        quantidade: i.quantidade,
        precoUnitario: Number(i.precoUnitario),
      })),
      recebidaEm: orm.recebidaEm,
      diagnosticoEm: orm.diagnosticoEm,
      aprovacaoSolicitadaEm: orm.aprovacaoSolicitadaEm,
      aprovadaEm: orm.aprovadaEm,
      execucaoIniciadaEm: orm.execucaoIniciadaEm,
      finalizadaEm: orm.finalizadaEm,
      entregueEm: orm.entregueEm,
      canceladaEm: orm.canceladaEm,
      criadoEm: orm.criadoEm,
      atualizadoEm: orm.atualizadoEm,
    });
  }

  private toOrm(os: OrdemServico): OrdemServicoOrmEntity {
    const orm = new OrdemServicoOrmEntity();
    if (os.id) orm.id = os.id;
    if (os.numero) orm.numero = os.numero;
    orm.clienteId = os.clienteId;
    orm.veiculoId = os.veiculoId;
    orm.status = os.status;
    orm.diagnostico = os.diagnostico;
    orm.recebidaEm = os.recebidaEm;
    orm.diagnosticoEm = os.diagnosticoEm;
    orm.aprovacaoSolicitadaEm = os.aprovacaoSolicitadaEm;
    orm.aprovadaEm = os.aprovadaEm;
    orm.execucaoIniciadaEm = os.execucaoIniciadaEm;
    orm.finalizadaEm = os.finalizadaEm;
    orm.entregueEm = os.entregueEm;
    orm.canceladaEm = os.canceladaEm;
    orm.itens = os.itens.map((i) => {
      const item = new ItemOSOrmEntity();
      if (i.id) item.id = i.id;
      item.tipo = i.tipo;
      item.referenciaId = i.referenciaId;
      item.descricao = i.descricao;
      item.quantidade = i.quantidade;
      item.precoUnitario = i.precoUnitario.toFixed(2);
      return item;
    });
    return orm;
  }

  async create(os: OrdemServico): Promise<OrdemServico> {
    const saved = await this.repo.save(this.toOrm(os));
    return this.toDomain(saved);
  }

  async update(os: OrdemServico): Promise<OrdemServico> {
    const saved = await this.repo.save(this.toOrm(os));
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<OrdemServico | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByNumero(numero: number): Promise<OrdemServico | null> {
    const orm = await this.repo.findOne({ where: { numero } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(filtro?: { status?: StatusOS; clienteId?: string }): Promise<OrdemServico[]> {
    const list = await this.repo.find({
      where: filtro,
      order: { criadoEm: 'DESC' },
    });
    return list.map((orm) => this.toDomain(orm));
  }

  async tempoMedioExecucaoMinutos(): Promise<number | null> {
    const result = await this.repo
      .createQueryBuilder('os')
      .select('AVG(EXTRACT(EPOCH FROM (os.finalizada_em - os.execucao_iniciada_em)) / 60)', 'media')
      .where('os.execucao_iniciada_em IS NOT NULL')
      .andWhere('os.finalizada_em IS NOT NULL')
      .getRawOne<{ media: string | null }>();
    const media = result?.media ? Number(result.media) : null;
    return media !== null ? Math.round(media) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
