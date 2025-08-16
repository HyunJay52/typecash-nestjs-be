import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/user-request-dto';
import { UpdateUserDto } from './dto/user-response-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from '@/utils/password.util';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        console.log('Creating user with data:', createUserDto);
        const existingUser = await this.prisma.users.findFirst({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }
        const hashedPassword = await hashPassword(createUserDto.password);
        const result = await this.prisma.users.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
            },
        });
        return result;
    }

    async findOne(id: number) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                rewardBalance: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findAll() {
        const result = await this.prisma.users.findMany({});
        return `This action returns all user`;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return await this.prisma.users.update({
            where: { id },
            data: updateUserDto,
        });
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
