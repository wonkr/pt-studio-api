import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator"

export class UpdateMembershipDto {
    @IsOptional()
    @IsUUID()
    sessionPassId?: string;

    @IsOptional()
    @IsEnum(["CARD", "CASH", "TRANSFER"], {
        message: 'valid payment method required'
    })
    paymentType?: "CARD"| "CASH"| "TRANSFER";
    
    @IsOptional()
    @IsEnum(["PAID", "PENDING", "REFUNDED"], {
        message: 'valid payment status required'
    })
    paymentStatus?: "PAID" | "PENDING" | "REFUNDED";

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
    remainingSessions?: number

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    usedSession?: number
}