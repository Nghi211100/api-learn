import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { UserDTO } from 'src/users/user.dto';
import { UserService } from 'src/users/user.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PostDTO } from './post.dto';
import { PostEntity } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  deleteByUserId(userId: string): Promise<any> {
    return this.postRepository.delete({
      user: { id: userId },
    });
  }

  deleteById(id: string): Promise<DeleteResult> {
    return this.postRepository.delete(id);
  }

  updatePostById(id: string, post: PostDTO): Promise<UpdateResult> {
    return this.postRepository.update(id, post);
  }

  async savePost(user: UserDTO, post: PostDTO): Promise<PostEntity> {
    post.user = user;
    return this.postRepository.save(post);
  }

  getPostById(id: string): Promise<PostEntity> {
    return this.postRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });
  }

  getAllPosts(): Promise<PostEntity[]> {
    return this.postRepository.find({
      relations: ['user'],
    });
  }

  plainPost(post: PostEntity): PostDTO {
    const respl = plainToInstance(PostDTO, post, {
      excludeExtraneousValues: true,
    });
    respl.user = plainToInstance(UserDTO, post.user, {
      excludeExtraneousValues: true,
    });
    return respl;
  }

  async authorizationAcc(idUserCurrent, idPost) {
    try {
      const resultPost = await this.getPostById(idPost);
      if (resultPost) {
        const result = await this.userService.authorization(
          idUserCurrent,
          resultPost.user.id,
        );
        if (result) return result;
        else return null;
      } else {
        return null;
      }
    } catch (error) {
      return 'An error occurred while deleting, please check id of post!';
    }
  }
}
