import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Peca } from '../domain/peca.entity';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';

export interface CreatePecaInput {
  sku: string;
  nome: string;
  descricao?: string;
  precoUnitario: number;
  estoque: number;
  estoqueMinimo: number;
  ativo?: boolean;
}

export type UpdatePecaInput = Partial<Omit<CreatePecaInput, 'sku' | 'estoque'>>;

@Injectable()
export class PecasService {
  constructor(@Inject(PECA_REPOSITORY) private readonly repository: PecaRepository) {}

  async create(input: CreatePecaInput): Promise<Peca> {
    const peca = new Peca(input);
    const existing = await this.repository.findBySku(peca.sku);
    if (existing) {
      throw new ConflictException('Já existe uma peça com este SKU');
    }
    return this.repository.create(peca);
  }

  findAll(includeInativas = false): Promise<Peca[]> {
    return this.repository.findAll(includeInativas);
  }

  findEstoqueBaixo(): Promise<Peca[]> {
    return this.repository.findEstoqueBaixo();
  }

  async findById(id: string): Promise<Peca> {
    const peca = await this.repository.findById(id);
    if (!peca) {
      throw new NotFoundException('Peça não encontrada');
    }
    return peca;
  }

  async update(id: string, input: UpdatePecaInput): Promise<Peca> {
    const atual = await this.findById(id);
    const updated = new Peca({
      id: atual.id,
      sku: atual.sku,
      nome: input.nome ?? atual.nome,
      descricao: input.descricao ?? atual.descricao,
      precoUnitario: input.precoUnitario ?? atual.precoUnitario,
      estoque: atual.estoque,
      estoqueMinimo: input.estoqueMinimo ?? atual.estoqueMinimo,
      ativo: input.ativo ?? atual.ativo,
      criadoEm: atual.criadoEm,
      atualizadoEm: new Date(),
    });
    return this.repository.update(updated);
  }

  async entradaEstoque(id: string, quantidade: number): Promise<Peca> {
    const peca = await this.findById(id);
    try {
      peca.entrada(quantidade);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
    return this.repository.update(peca);
  }

  async saidaEstoque(id: string, quantidade: number): Promise<Peca> {
    const peca = await this.findById(id);
    try {
      peca.saida(quantidade);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
    return this.repository.update(peca);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
