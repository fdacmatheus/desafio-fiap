import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Servico } from '../domain/servico.entity';
import { SERVICO_REPOSITORY, ServicoRepository } from '../domain/servico.repository';

export interface CreateServicoInput {
  nome: string;
  descricao?: string;
  preco: number;
  duracaoEstimadaMinutos: number;
  ativo?: boolean;
}

export type UpdateServicoInput = Partial<CreateServicoInput>;

@Injectable()
export class ServicosService {
  constructor(@Inject(SERVICO_REPOSITORY) private readonly repository: ServicoRepository) {}

  create(input: CreateServicoInput): Promise<Servico> {
    return this.repository.create(new Servico(input));
  }

  findAll(includeInativos = false): Promise<Servico[]> {
    return this.repository.findAll(includeInativos);
  }

  async findById(id: string): Promise<Servico> {
    const servico = await this.repository.findById(id);
    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return servico;
  }

  async update(id: string, input: UpdateServicoInput): Promise<Servico> {
    const atual = await this.findById(id);
    const updated = new Servico({
      id: atual.id,
      nome: input.nome ?? atual.nome,
      descricao: input.descricao ?? atual.descricao,
      preco: input.preco ?? atual.preco,
      duracaoEstimadaMinutos: input.duracaoEstimadaMinutos ?? atual.duracaoEstimadaMinutos,
      ativo: input.ativo ?? atual.ativo,
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
