import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './application/auth.service';
import { USER_REPOSITORY } from './domain/user.repository';
import { JwtRefreshStrategy } from './infrastructure/jwt-refresh.strategy';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { UserTypeOrmRepository } from './infrastructure/user.typeorm.repository';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '15m') as never,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
