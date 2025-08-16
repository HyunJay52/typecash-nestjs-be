import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './user-request-dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
