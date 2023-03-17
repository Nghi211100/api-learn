import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private useRepository: Repository<UserEntity>,
  ) {}

  deleteById(id: string): Promise<DeleteResult> {
    return this.useRepository.delete(id);
  }

  updateUserById(id: string, user: UserDTO): Promise<UpdateResult> {
    if (user.isActive) {
      const userIsActive = user.isActive.toString();
      if (userIsActive === 'true') {
        user.isActive = true;
      } else {
        user.isActive = false;
      }
    }
    return this.useRepository.update(id, user);
  }

  async saveUser(user: UserDTO): Promise<UserEntity> {
    user.password = await this.hashPassword(user.password);
    return this.useRepository.save(user);
  }

  getUserByUserName(userName: string): Promise<UserEntity> {
    return this.useRepository.findOne({
      where: { userName: userName },
    });
  }

  getUserById(id: string): Promise<UserEntity> {
    return this.useRepository.findOne({
      where: { id: id },
      relations: ['posts'],
    });
  }

  getAllUsers(): Promise<UserEntity[]> {
    return this.useRepository.find({ relations: ['posts'] });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }
}
