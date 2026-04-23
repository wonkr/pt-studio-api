import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateSessionPassDto {
    @ApiProperty({ example: '30-Session Pass', description: 'Session pass name' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: 30, description: 'Total number of sessions (1-100)' })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(100)
    totalSessions!: number;

    @ApiProperty({ example: 1500000, description: 'Price in KRW (0-10,000,000)' })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(10_000_000)
    price!: number;

    @ApiProperty({ example: 90, description: 'Validity period in days (0-365)' })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(365)
    validDays!: number;
}