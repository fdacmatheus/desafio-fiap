import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientesService } from 'src/modules/clientes/application/clientes.service';
import { Veiculo } from '../domain/veiculo.entity';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../domain/veiculo.repository';

export interface CreateVeiculoInput {
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
}

export type UpdateVeiculoInput = Partial<CreateVeiculoInput>;

@Injectable()
export class VeiculosService {
  constructor(
    @Inject(VEICULO_REPOSITORY) private readonly repository: VeiculoRepository,
    private readonly clientes: ClientesService,
  ) {}

  async create(input: CreateVeiculoInput): Promise<Veiculo> {
    await this.clientes.findById(input.clienteId);
    const veiculo = new Veiculo(input);
    const existing = await this.repository.findByPlaca(veiculo.placa);
    if (existing) {
      throw new ConflictException('Já existe um veículo cadastrado com esta placa');
    }
    return this.repository.create(veiculo);
  }

  async findAll(): Promise<Veiculo[]> {
    return this.repository.findAll();
  }

  async findByCliente(clienteId: string): Promise<Veiculo[]> {
    await this.clientes.findById(clienteId);
    return this.repository.findByClienteId(clienteId);
  }

  async findById(id: string): Promise<Veiculo> {
    const veiculo = await this.repository.findById(id);
    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }
    return veiculo;
  }

  async update(id: string, input: UpdateVeiculoInput): Promise<Veiculo> {
    const atual = await this.findById(id);
    if (input.clienteId && input.clienteId !== atual.clienteId) {
      await this.clientes.findById(input.clienteId);
    }
    const updated = new Veiculo({
      id: atual.id,
      clienteId: input.clienteId ?? atual.clienteId,
      placa: input.placa ?? atual.placa,
      marca: input.marca ?? atual.marca,
      modelo: input.modelo ?? atual.modelo,
      ano: input.ano ?? atual.ano,
      criadoEm: atual.criadoEm,
      atualizadoEm: new Date(),
    });
    return this.repository.update(updated);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
