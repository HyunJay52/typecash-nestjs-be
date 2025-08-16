import {
    IsEmail,
    IsNotEmpty,
    isNotEmpty,
    IsString,
    Min,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
