import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Max, Min } from "class-validator"

export class CreateMemberDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsPhoneNumber('KR', {message: "Not a valid phone number"})
    phone!: string;

    @IsOptional()
    @IsString()
    sessionPassId!: string;

    @IsNotEmpty()
    @IsString()
    sessionPassName!: string;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(100)
    sessionPassTotalSessions!: number;
    
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(10_000_000)
    sessionPassPrice!: number;
    
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(365)
    sessionPassValidDays!: number;

    @IsNotEmpty()
    @IsEnum(["CARD", "CASH", "TRANSFER"], {
        message: 'valid payment method required'
    })
    paymentType!: "CARD"| "CASH"| "TRANSFER";
    
    @IsNotEmpty()
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
}