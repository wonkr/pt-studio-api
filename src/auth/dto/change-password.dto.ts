import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ChangePasswordDto {
    @ApiProperty({ example: 'NewPassword456!', description: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol' })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    newPassword!: string;

    @ApiProperty({ example: 'NewPassword456!', description: 'Must match newPassword' })
    @IsString()
    @IsNotEmpty()
    confirmPassword!: string;
}