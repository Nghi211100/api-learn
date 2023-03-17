import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostDTO } from 'src/posts/post.dto';
import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUserById(@Param('id') id: string): Promise<string> {
    const result = await this.userService.deleteById(id);
    if (result.affected === 1) {
      return 'Delete Successful!';
    } else {
      return 'An error occurred while deleting, please check id of user!';
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUserById(@Param('id') id: string, @Body() user: UserDTO) {
    try {
      await this.userService.updateUserById(id, user);
      return this.getUserById(id);
    } catch (error) {
      return 'An error occurred while updating, please check property or id of user!';
    }
  }

  @Post()
  createUser(@Body() user: UserDTO): UserDTO {
    const result = this.userService.saveUser(user);
    return plainToInstance(UserDTO, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDTO> {
    const result = await this.userService.getUserById(id);
    return this.plainUser(result);
  }

  @Get()
  async getAllUsers(): Promise<UserDTO[]> {
    const result = await this.userService.getAllUsers();
    const plainArray = result.map((res) => this.plainUser(res));
    return plainArray;
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
}
