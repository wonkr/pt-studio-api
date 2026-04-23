import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateTrainerDto {
    @ApiProperty({ example: 'Kyu Won', description: 'Trainer name' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'user@example.com', description: 'Trainer email address (unique)' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'Password123!', description: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol' })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    password!: string;

    @ApiProperty({ example: 'Password123!', description: 'Must match password' })
    @IsString()
    @IsNotEmpty()
    confirmPassword!: string;
}