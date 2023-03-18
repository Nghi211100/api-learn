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
import { PostDTO } from './post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePostById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<string> {
    const resultAuth = await this.postService.authorizationAcc(req.user.id, id);
    if (resultAuth) return resultAuth;
    const result = await this.postService.deleteById(id);
    if (result.affected === 1) {
      return 'Delete Successful!';
    } else {
      return 'An error occurred while deleting, please check id of post!';
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePostById(
    @Param('id') id: string,
    @Body() post: PostDTO,
    @Request() req,
  ) {
    try {
      const result = this.postService.authorizationAcc(req.user.id, id);
      if (result) return result;
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
    return this.postService.plainPost(result);
  }

  @Get()
  async getAllPosts(): Promise<PostDTO[]> {
    const result = await this.postService.getAllPosts();
    const plainArray = result.map((res) => this.postService.plainPost(res));
    return plainArray;
  }
}
