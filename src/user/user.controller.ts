import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Logger,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user-request-dto';
import { UpdateUserDto } from './dto/user-response-dto';
import { Public } from '@/auth/decorators/public.decorator';
import { RoleGuard } from '@/auth/guards/role.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED || HttpStatus.OK)
    create(@Body() createUserDto: CreateUserDto) {
        Logger.log('Creating user with data:', createUserDto);
        return this.userService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @HttpCode(HttpStatus.OK)
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
