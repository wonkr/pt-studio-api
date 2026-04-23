import { IsNotEmpty, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class VerifyPasswordDto {
    @ApiProperty({ example: 'Password123!', description: 'Current password to verify before changing' })
    @IsString()
    @IsNotEmpty()
    currentPassword!: string;
}