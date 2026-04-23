import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateMembershipDto {
    @ApiPropertyOptional({ example: 'session-pass-uuid' })
    @IsOptional()
    @IsUUID()
    sessionPassId?: string;

    @ApiPropertyOptional({ example: 'CARD', enum: ['CARD', 'CASH', 'TRANSFER'] })
    @IsOptional()
    @IsEnum(["CARD", "CASH", "TRANSFER"], {
        message: 'valid payment method required'
    })
    paymentType?: "CARD"| "CASH"| "TRANSFER";

    @ApiPropertyOptional({ example: 'REFUNDED', enum: ['PAID', 'PENDING', 'REFUNDED'] })
    @IsOptional()
    @IsEnum(["PAID", "PENDING", "REFUNDED"], {
        message: 'valid payment status required'
    })
    paymentStatus?: "PAID" | "PENDING" | "REFUNDED";

    @ApiPropertyOptional({ example: '2026-04-12T00:00:00.000Z' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    paidAt?: Date;

    @ApiPropertyOptional({ example: '2026-04-12T00:00:00.000Z' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    membershipStartedAt?: Date;

    @ApiPropertyOptional({ example: '2026-08-12T00:00:00.000Z' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    membershipExpiredAt?: Date;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    remainingSessions?: number

    @ApiPropertyOptional({ example: 5 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    usedSession?: number
}