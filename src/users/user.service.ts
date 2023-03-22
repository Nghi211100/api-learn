import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import { PostService } from 'src/posts/post.service';
import { plainToInstance } from 'class-transformer';
import { PostDTO } from 'src/posts/post.dto';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private useRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
    private mailerService: MailerService,
    private configService: ConfigService,
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
    const resultUserEmail = await this.getUserByObject({ email: user.email });
    if (resultUserEmail) {
      return 'This email is exist!';
    }
    user.password = await this.hashPassword(user.password);
    const newUser = await this.useRepository.save(user);
    const plainUser = this.plainUser(newUser);

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to my website',
      template: './activedAccount',
      context: {
        name: plainUser.fullName,
        link: `${this.configService.get('DOMAIN')}/auth/active/${plainUser.id}`,
      },
    });

    return newUser;
  }

  getUserByObject(object): Promise<UserEntity> {
    return this.useRepository.findOne({
      where: object,
    });
  }

  getUserById(id: string): Promise<UserEntity> {
    return this.useRepository.findOne({
      where: { id: id },
      relations: ['posts'],
    });
  }

  getAllUsers(page = 1, limit = 99): Promise<UserEntity[]> {
    return this.useRepository.find({
      relations: ['posts'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        created_at: 'DESC',
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async authorization(idCurrent: string, idInput: string) {
    const result = await this.getUserById(idCurrent);
    if (result.role === 'customer' && result.id !== idInput) {
      return 'You do not have permission to execute this command!';
    }
    return null;
  }

  plainUser(user: UserEntity): UserDTO {
    const respl = plainToInstance(UserDTO, user, {
      excludeExtraneousValues: true,
    });
    respl.posts = plainToInstance(PostDTO, user.posts, {
      excludeExtraneousValues: true,
    });
    return respl;
  }

  async checkUserActived(idCurrent: string) {
    const result = await this.getUserById(idCurrent);
    if (result.isActive === false) {
      return 'You have not activated your account yet!';
    }
    return null;
  }

  async getUserByRefreshToken(refresh_token: string, email: string) {
    const user = await this.getUserByObject({ email: email });
    if (user) {
      const result = await bcrypt.compare(refresh_token, user.refresh_token);
      if (result) {
        return user;
      }
      return 'The token key is incorrect or expired';
    }
    return 'User not found';
  }
}
