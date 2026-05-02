import { IsInt, IsNotEmpty, IsUUID, Max, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateTrainerPayoutDto {
    @ApiProperty({ example: 'join-request-uuid', description: 'Join Request UUID' })
    @IsNotEmpty()
    @IsUUID()
    joinRequestId!: string

    @ApiProperty({ example: 'org-uuid', description: 'Organization UUID' })
    @IsNotEmpty()
    @IsUUID()
    orgId!: string

    @ApiProperty({ example: 'trainer-uuid', description: 'Trainer UUID' })
    @IsNotEmpty()
    @IsUUID()
    trainerId!: string

    @ApiProperty({ example: 30000, description: 'payout per session in KRW (0-1000,000)' })
    @IsInt()
    @Min(0)
    @Max(1000_000)
    payoutPerSession!: number
}