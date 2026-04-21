import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional,IsPositive, IsString, IsUUID, Max, Min } from "class-validator"

export class CreateMembershipDto {
    @IsNotEmpty()
    @IsUUID()
    memberId!: string;

    @IsOptional()
    @IsUUID()
    sessionPassId?: string;

    @IsNotEmpty()
    @IsString()
    sessionPassName!: string;

    @IsInt()
    @Min(0)
    @Max(100)
    sessionPassTotalSessions!: number;
    
    @IsInt()
    @Min(0)
    @Max(10_000_000)
    sessionPassPrice!: number;
    
    @IsInt()
    @Min(0)
    @Max(365)
    sessionPassValidDays!: number;

    @IsEnum(["CARD", "CASH", "TRANSFER"], {
        message: 'valid payment method required'
    })
    paymentType!: "CARD"| "CASH"| "TRANSFER";
    
    @IsEnum(["PAID", "PENDING", "REFUNDED"], {
        message: 'valid payment status required'
    })
    paymentStatus!: "PAID" | "PENDING" | "REFUNDED";

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    paidAt?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    membershipStartedAt?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    membershipExpiredAt?: Date;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    remainingSessions?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    usedSession?: number;
}