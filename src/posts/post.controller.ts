import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserDTO } from 'src/users/user.dto';
import { PostDTO } from './post.dto';
import { PostEntity } from './post.entity';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePostById(@Param('id') id: string): Promise<string> {
    try {
      await this.postService.deleteById(id);
      return 'Delete Successful!';
    } catch (error) {
      return 'An error occurred while deleting, please check id of post!';
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePostById(@Param('id') id: string, @Body() post: PostDTO) {
    try {
      await this.postService.updatePostById(id, post);
      return this.getPostById(id);
    } catch (error) {
      return 'An error occurred while updating, please check property or id of post!';
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() post: PostDTO, @Request() req): Promise<PostDTO> {
    const result = await this.postService.savePost(req.user, post);
    return plainToInstance(PostDTO, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<PostDTO> {
    const result = await this.postService.getPostById(id);
    return this.plainPost(result);
  }

  @Get()
  async getAllPosts(): Promise<PostDTO[]> {
    const result = await this.postService.getAllPosts();
    const plainArray = result.map((res) => this.plainPost(res));
    return plainArray;
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
}
