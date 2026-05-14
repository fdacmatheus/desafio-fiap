import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { AuthenticatedUser, CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokensDto } from './dto/tokens.dto';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cria um novo usuário administrativo' })
  @ApiResponse({ status: 201, type: TokensDto })
  register(@Body() dto: RegisterDto): Promise<TokensDto> {
    return this.service.register(dto.username, dto.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica um usuário e retorna access + refresh tokens' })
  @ApiResponse({ status: 200, type: TokensDto })
  login(@Body() dto: LoginDto): Promise<TokensDto> {
    return this.service.login(dto.username, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Renova os tokens usando o refresh token (Authorization: Bearer <refresh>)',
  })
  @ApiResponse({ status: 200, type: TokensDto })
  refresh(@CurrentUser() user: AuthenticatedUser): Promise<TokensDto> {
    return this.service.refresh(user.userId);
  }
}
