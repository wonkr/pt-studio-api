import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsOptional, Max, Min } from "class-validator"

export class OrgExpenseSummaryQueryDto {
    @Type(() => Number)
    @IsNotEmpty({message: "year is required (2000-current year)"})
    @IsInt()
    @Min(2000)
    @Max(new Date().getFullYear())
    year!: number

    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    month!: number
}