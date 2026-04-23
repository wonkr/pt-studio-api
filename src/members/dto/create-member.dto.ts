import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Max, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateMemberDto {
    @ApiProperty({ example: 'Jay Choi', description: 'Member name' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: '01012345678', description: 'Korean phone number' })
    @IsPhoneNumber('KR', {message: "Not a valid phone number"})
    phone!: string;

    @ApiPropertyOptional({ example: 'uuid-of-session-pass', description: 'Predefined session pass ID (optional)' })
    @IsOptional()
    @IsString()
    sessionPassId?: string;

    @ApiProperty({ example: '30-Session Pass', description: 'Session pass name' })
    @IsNotEmpty()
    @IsString()
    sessionPassName!: string;

    @ApiProperty({ example: 30, description: 'Total number of sessions (1-100)' })
    @IsInt()
    @Min(0)
    @Max(100)
    sessionPassTotalSessions!: number;

    @ApiProperty({ example: 1500000, description: 'Session pass price in KRW (0-10,000,000)' })
    @IsInt()
    @Min(0)
    @Max(10_000_000)
    sessionPassPrice!: number;

    @ApiProperty({ example: 90, description: 'Valid days from start date (0-365)' })
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
}