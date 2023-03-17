import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import { PostService } from 'src/posts/post.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private useRepository: Repository<UserEntity>,
    private postService: PostService,
  ) {}

  async deleteById(id: string): Promise<DeleteResult> {
    const result = await this.postService.deleteByUserId(id);
    if (result) {
      return this.useRepository.delete(id);
    } else {
      return null;
    }
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

  async saveUser(user: UserDTO): Promise<any> {
    const result = await this.getUserByUserName(user.userName);
    if (result) {
      return 'This user name is exist!';
    }
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
