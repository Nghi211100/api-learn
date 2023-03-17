import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDTO } from 'src/users/user.dto';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PostDTO } from './post.dto';
import { PostEntity } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
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
}
