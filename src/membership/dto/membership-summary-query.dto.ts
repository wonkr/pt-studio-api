import { Type } from "class-transformer"
import { IsInt, Max, Min } from "class-validator"

export class MembershipSummaryQueryDto {
    @Type(() => Number)
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