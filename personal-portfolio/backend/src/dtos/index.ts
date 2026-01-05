import { IsString, MinLength, MaxLength, IsOptional, IsArray, IsEnum, IsEmail } from 'class-validator';

export class CreateEntryDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @IsString()
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  @MaxLength(50000, { message: 'Content must not exceed 50,000 characters' })
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Summary must not exceed 500 characters' })
  summary?: string;

  @IsOptional()
  @IsString({ message: 'Entry date must be a string' })
  entryDate?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], { message: 'Status must be draft, published, or archived' })
  status?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}

export class UpdateEntryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  @MaxLength(50000, { message: 'Content must not exceed 50,000 characters' })
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Summary must not exceed 500 characters' })
  summary?: string;

  @IsOptional()
  @IsString({ message: 'Entry date must be a string' })
  entryDate?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], { message: 'Status must be draft, published, or archived' })
  status?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
