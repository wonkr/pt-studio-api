import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateScheduleDto {
    @IsUUID()
    conductedByTrainerId?: string
    
    @IsUUID()
    roomId?: string

    @ApiPropertyOptional({ example: '2026-05-01T14:00:00.000Z', description: 'Rescheduled start time (ISO 8601)' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    scheduledAt?: Date

    @ApiPropertyOptional({ example: 60, description: 'Session duration in minutes (1-120)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(120)
    sessionDuration?: number

    @ApiPropertyOptional({ example: 'ATTENDED', enum: ['SCHEDULED', 'ATTENDED', 'CANCELLED', 'NOSHOW'] })
    @IsOptional()
    @IsEnum(["SCHEDULED", "ATTENDED", "CANCELLED", "NOSHOW"], {
        message: 'valid attendance status required'
    })
    status?: "SCHEDULED" | "ATTENDED" | "CANCELLED" | "NOSHOW";

    @ApiPropertyOptional({ example: 'Member requested cancellation' })
    @IsOptional()
    @IsString()
    cancelReason?: string
}
