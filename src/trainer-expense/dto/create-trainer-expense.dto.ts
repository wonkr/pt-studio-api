import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateTrainerExpenseDto {
    @ApiProperty({ example: 'RENT', enum: ['RENT', 'UTILITY', 'SUPPLY', 'OTHER'] })
    @IsNotEmpty()
    @IsEnum(["RENT", "UTILITY", "SUPPLY", "OTHER"], {
        message: 'valid category is required'
    })
    category!: "RENT"| "UTILITY"| "SUPPLY"| "OTHER";

    @ApiProperty({ example: 2000000, description: 'Amount in KRW, integer only (0-100,000,000)' })
    @IsInt()
    @Min(0)
    @Max(100_000_000)
    amount!: number;

    @ApiProperty({ example: 'April studio rent', description: 'Memo (max 500 chars)' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    memo!: string;

    @ApiProperty({ example: '2026-04-01T00:00:00.000Z', description: 'Payment date (ISO 8601)' })
    @IsDate()
    @Type(()=>Date)
    paidAt!: Date
}