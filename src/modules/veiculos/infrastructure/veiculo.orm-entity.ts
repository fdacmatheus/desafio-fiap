import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'veiculos' })
@Index(['clienteId'])
export class VeiculoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'cliente_id' })
  clienteId!: string;

  @Column({ type: 'varchar', length: 8, unique: true })
  placa!: string;

  @Column({ type: 'varchar', length: 40 })
  marca!: string;

  @Column({ type: 'varchar', length: 60 })
  modelo!: string;

  @Column({ type: 'int' })
  ano!: number;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm!: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm!: Date;
}
