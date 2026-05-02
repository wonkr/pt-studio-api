import { Type } from "class-transformer"
import { IsDate, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateScheduleDto {
    @ApiProperty({ example: 'member-uuid', description: 'Member UUID' })
    @IsUUID()
    memberId!: string

    @ApiProperty({ example: 'membership-uuid', description: 'Membership UUID' })
    @IsUUID()
    membershipId!: string

    @IsUUID()
    conductedByTrainerId!: string

    @IsUUID()
    roomId!: string

    @ApiProperty({ example: '2026-05-01T10:00:00.000Z', description: 'Scheduled session start time (ISO 8601)' })
    @IsDate()
    @Type(() => Date)
    scheduledAt!: Date

    @ApiProperty({ example: 60, description: 'Session duration in minutes (1-120)' })
    @IsInt()
    @Min(0)
    @Max(120)
    sessionDuration!: number

    @ApiProperty({ example: 'SCHEDULED', enum: ['SCHEDULED', 'ATTENDED', 'CANCELLED', 'NOSHOW'] })
    @IsEnum(["SCHEDULED", "ATTENDED", "CANCELLED", "NOSHOW"], {
        message: 'valid attendance status required'
    })
    status!: "SCHEDULED" | "ATTENDED" | "CANCELLED" | "NOSHOW";

    @ApiPropertyOptional({ example: 'Member requested cancellation' })
    @IsOptional()
    @IsString()
    cancelReason?: string
}
