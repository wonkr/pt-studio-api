import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateMembershipDto {
    @ApiProperty({ example: 'member-uuid', description: 'Member UUID' })
    @IsNotEmpty()
    @IsUUID()
    memberId!: string;

    @ApiPropertyOptional({ example: 'session-pass-uuid', description: 'Predefined session pass ID (optional)' })
    @IsOptional()
    @IsUUID()
    sessionPassId?: string;

    @ApiProperty({ example: '30-Session Pass' })
    @IsNotEmpty()
    @IsString()
    sessionPassName!: string;

    @ApiProperty({ example: 30, description: 'Total sessions (1-100)' })
    @IsInt()
    @Min(0)
    @Max(100)
    sessionPassTotalSessions!: number;

    @ApiProperty({ example: 1500000, description: 'Price in KRW (0-10,000,000)' })
    @IsInt()
    @Min(0)
    @Max(10_000_000)
    sessionPassPrice!: number;

    @ApiProperty({ example: 90, description: 'Valid days (0-365)' })
    @IsInt()
    @Min(0)
    @Max(365)
    sessionPassValidDays!: number;

    @ApiProperty({ example: 'CARD', enum: ['CARD', 'CASH', 'TRANSFER'] })
    @IsEnum(["CARD", "CASH", "TRANSFER"], {
        message: 'valid payment method required'
    })
    paymentType!: "CARD"| "CASH"| "TRANSFER";

    @ApiProperty({ example: 'PAID', enum: ['PAID', 'PENDING', 'REFUNDED'] })
    @IsEnum(["PAID", "PENDING", "REFUNDED"], {
        message: 'valid payment status required'
    })
    paymentStatus!: "PAID" | "PENDING" | "REFUNDED";

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

    @ApiPropertyOptional({ example: '2026-07-12T00:00:00.000Z' })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    membershipExpiredAt?: Date;

    @ApiPropertyOptional({ example: 30, description: 'Defaults to sessionPassTotalSessions if omitted' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    remainingSessions?: number;

    @ApiPropertyOptional({ example: 0, description: 'Defaults to 0' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    usedSession?: number;
}