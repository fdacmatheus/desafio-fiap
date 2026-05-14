import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserTypeOrmRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  private toDomain(orm: UserOrmEntity): User {
    return new User({
      id: orm.id,
      username: orm.username,
      passwordHash: orm.passwordHash,
      criadoEm: orm.criadoEm,
      atualizadoEm: orm.atualizadoEm,
    });
  }

  private toOrm(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    if (user.id) orm.id = user.id;
    orm.username = user.username;
    orm.passwordHash = user.passwordHash;
    return orm;
  }

  async create(user: User): Promise<User> {
    const saved = await this.repo.save(this.toOrm(user));
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { username: username.toLowerCase() } });
    return orm ? this.toDomain(orm) : null;
  }
}
