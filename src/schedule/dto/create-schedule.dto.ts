import { Type } from "class-transformer"
import { IsDate, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator"

export class CreateScheduleDto {
    @IsUUID()
    memberId!: string

    @IsUUID()
    membershipId!: string

    @IsDate()
    @Type(() => Date)
    scheduledAt!: Date

    @IsInt()
    @Min(0)
    @Max(120)
    sessionDuration!:number

     @IsEnum(["SCHEDULED", "ATTENDED", "CANCELLED", "NOSHOW"], {
        message: 'valid attendance status required'
    })
    status!: "SCHEDULED" | "ATTENDED" | "CANCELLED" | "NOSHOW";

    @IsOptional()
    @IsString()
    cancelReason?: string
}
