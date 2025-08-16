import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    IsNumber,
} from 'class-validator';

export class CreateMissionDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsNumber()
    @IsOptional()
    reward?: number;
}

export class SubmitMissionDto {
    @IsNumber()
    @IsNotEmpty()
    missionId: number;

    @IsString()
    @IsNotEmpty()
    answer: string;
}
