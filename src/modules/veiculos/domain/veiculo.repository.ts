import { Veiculo } from './veiculo.entity';

export const VEICULO_REPOSITORY = Symbol('VEICULO_REPOSITORY');

export interface VeiculoRepository {
  create(veiculo: Veiculo): Promise<Veiculo>;
  update(veiculo: Veiculo): Promise<Veiculo>;
  findById(id: string): Promise<Veiculo | null>;
  findByPlaca(placa: string): Promise<Veiculo | null>;
  findByClienteId(clienteId: string): Promise<Veiculo[]>;
  findAll(): Promise<Veiculo[]>;
  delete(id: string): Promise<void>;
}
