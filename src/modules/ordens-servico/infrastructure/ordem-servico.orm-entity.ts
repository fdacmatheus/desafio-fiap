import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusOS } from '../domain/status-os';
import { ItemOSOrmEntity } from './item-os.orm-entity';

@Entity({ name: 'ordens_servico' })
@Index(['clienteId'])
@Index(['veiculoId'])
@Index(['status'])
export class OrdemServicoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', unique: true })
  @Generated('increment')
  numero!: number;

  @Column({ type: 'uuid', name: 'cliente_id' })
  clienteId!: string;

  @Column({ type: 'uuid', name: 'veiculo_id' })
  veiculoId!: string;

  @Column({ type: 'varchar', length: 30, default: StatusOS.RECEBIDA })
  status!: StatusOS;

  @Column({ type: 'text', nullable: true })
  diagnostico!: string | null;

  @OneToMany(() => ItemOSOrmEntity, (item) => item.ordemServico, {
    cascade: true,
    eager: true,
  })
  itens!: ItemOSOrmEntity[];

  @Column({ type: 'timestamp', name: 'recebida_em' })
  recebidaEm!: Date;

  @Column({ type: 'timestamp', name: 'diagnostico_em', nullable: true })
  diagnosticoEm!: Date | null;

  @Column({ type: 'timestamp', name: 'aprovacao_solicitada_em', nullable: true })
  aprovacaoSolicitadaEm!: Date | null;

  @Column({ type: 'timestamp', name: 'aprovada_em', nullable: true })
  aprovadaEm!: Date | null;

  @Column({ type: 'timestamp', name: 'execucao_iniciada_em', nullable: true })
  execucaoIniciadaEm!: Date | null;

  @Column({ type: 'timestamp', name: 'finalizada_em', nullable: true })
  finalizadaEm!: Date | null;

  @Column({ type: 'timestamp', name: 'entregue_em', nullable: true })
  entregueEm!: Date | null;

  @Column({ type: 'timestamp', name: 'cancelada_em', nullable: true })
  canceladaEm!: Date | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
