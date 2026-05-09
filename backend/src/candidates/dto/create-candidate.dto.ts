import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @MinLength(3)
  fullName: string;

  @IsDateString()
  birthDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  desiredSalary: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === undefined ? undefined : String(value).trim(),
  )
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : String(value).trim(),
  )
  @IsString()
  phone?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : String(value).trim(),
  )
  @IsString()
  desiredPosition?: string;
}
