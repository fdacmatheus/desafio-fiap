import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/presentation/jwt-auth.guard';
import { OrdensServicoService } from '../application/ordens-servico.service';
import { StatusOS } from '../domain/status-os';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { IniciarDiagnosticoDto } from './dto/iniciar-diagnostico.dto';
import { OrdemServicoPresenter } from './ordem-servico.presenter';

@ApiTags('ordens-servico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ordens-servico')
export class OrdensServicoController {
  constructor(private readonly service: OrdensServicoService) {}

  @Post()
  async create(@Body() dto: CreateOrdemServicoDto) {
    const os = await this.service.create(dto);
    return OrdemServicoPresenter.detail(os);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: StatusOS })
  @ApiQuery({ name: 'clienteId', required: false, type: String })
  async findAll(@Query('status') status?: StatusOS, @Query('clienteId') clienteId?: string) {
    const list = await this.service.findAll({ status, clienteId });
    return list.map((os) => OrdemServicoPresenter.summary(os));
  }

  @Get('tempo-medio-execucao')
  @ApiOperation({
    summary: 'Tempo médio de execução das OSs em minutos (entre aprovação e finalização)',
  })
  async tempoMedio() {
    const minutos = await this.service.tempoMedioExecucaoMinutos();
    return { tempoMedioMinutos: minutos };
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Consulta apenas a situação atual da OS' })
  async status(@Param('id', ParseUUIDPipe) id: string) {
    const os = await this.service.findById(id);
    return OrdemServicoPresenter.status(os);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const os = await this.service.findById(id);
    return OrdemServicoPresenter.detail(os);
  }

  @Patch(':id/diagnostico')
  @ApiOperation({ summary: 'Inicia o diagnóstico da OS' })
  async iniciarDiagnostico(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: IniciarDiagnosticoDto,
  ) {
    const os = await this.service.iniciarDiagnostico(id, dto.diagnostico);
    return OrdemServicoPresenter.detail(os);
  }

  @Patch(':id/solicitar-aprovacao')
  @ApiOperation({ summary: 'Envia o orçamento para aprovação do cliente' })
  async solicitarAprovacao(@Param('id', ParseUUIDPipe) id: string) {
    const os = await this.service.solicitarAprovacao(id);
    return OrdemServicoPresenter.detail(os);
  }

  @Patch(':id/aprovar')
  @ApiOperation({
    summary: 'Aprova o orçamento, dá baixa no estoque das peças e inicia a execução',
  })
  async aprovar(@Param('id', ParseUUIDPipe) id: string) {
    const os = await this.service.aprovar(id);
    return OrdemServicoPresenter.detail(os);
  }

  @Patch(':id/finalizar')
  async finalizar(@Param('id', ParseUUIDPipe) id: string) {
    const os = await this.service.finalizar(id);
    return OrdemServicoPresenter.detail(os);
  }

  @Patch(':id/entregar')
  async entregar(@Param('id', ParseUUIDPipe) id: string) {
    const os = await this.service.entregar(id);
    return OrdemServicoPresenter.detail(os);
  }

  @Patch(':id/cancelar')
  async cancelar(@Param('id', ParseUUIDPipe) id: string) {
    const os = await this.service.cancelar(id);
    return OrdemServicoPresenter.detail(os);
  }
}
