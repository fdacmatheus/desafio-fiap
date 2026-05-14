import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TipoItem } from '../domain/item-os';
import { OrdemServicoOrmEntity } from './ordem-servico.orm-entity';

@Entity({ name: 'os_itens' })
export class ItemOSOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'ordem_servico_id' })
  ordemServicoId!: string;

  @ManyToOne(() => OrdemServicoOrmEntity, (os) => os.itens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ordem_servico_id' })
  ordemServico?: OrdemServicoOrmEntity;

  @Column({ type: 'varchar', length: 10 })
  tipo!: TipoItem;

  @Column({ type: 'uuid', name: 'referencia_id' })
  referenciaId!: string;

  @Column({ type: 'varchar', length: 200 })
  descricao!: string;

  @Column({ type: 'int' })
  quantidade!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'preco_unitario' })
  precoUnitario!: string;
}
