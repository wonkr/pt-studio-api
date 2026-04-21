import { IsInt, IsNotEmpty, IsPositive, IsString, Max, Min } from "class-validator"

export class CreateSessionPassDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(100)
    totalSessions!: number;
    
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(10_000_000)
    price!: number;
    
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(365)
    validDays!: number;
}