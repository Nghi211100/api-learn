import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly useRepository: Repository<UserEntity>,
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

  saveUser(user: UserDTO): Promise<UserEntity> {
    return this.useRepository.save(user);
  }

  getUserById(id: string): Promise<UserEntity> {
    return this.useRepository.findOne({
      where: { id: id },
    });
  }

  getAllUsers(): Promise<UserEntity[]> {
    return this.useRepository.find();
  }
}
