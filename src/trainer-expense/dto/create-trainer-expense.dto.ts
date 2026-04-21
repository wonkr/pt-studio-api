import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from "class-validator"

export class CreateTrainerExpenseDto {
    @IsNotEmpty()
    @IsEnum(["RENT", "UTILITY", "SUPPLY", "OTHER"], {
        message: 'valid category is required'
    })
    category!: "RENT"| "UTILITY"| "SUPPLY"| "OTHER";

    @IsInt()
    @Min(0)
    @Max(100_000_000)
    amount!: number;
    
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    memo!: string;

    @IsDate()
    @Type(()=>Date)
    paidAt!: Date
}