import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, Max, Min } from "class-validator"

export class MembershipSummaryQueryDto {
    @Type(() => Number)
    @IsNotEmpty({message: "year is required (2000-current year)"})
    @IsInt()
    @Min(2000)
    @Max(new Date().getFullYear())
    year!: number

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    month!: number
}