import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const result = await this.prisma.users.findMany({});
    console.log(result);
    return `This action returns all user`;
  }

  async findOne(id: number) {
    const result = this.prisma.users.findFirst({
      where: {
        email: 'test email',
        password: 'test password',
      },
      select: {
        id: true,
        email: true,
        reward_balance: true,
      },
    });

    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
