import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness/readiness probe para o Kubernetes' })
  check() {
    return { status: 'ok', uptime: process.uptime() };
  }
}
