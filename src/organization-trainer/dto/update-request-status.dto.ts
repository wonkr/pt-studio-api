import { IsEnum, IsNotEmpty, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateRequestStatusDto {
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

    @ApiProperty({ example: 'PENDING', enum: ['PENING', 'APPROVED', 'REJECTED'] })
    @IsNotEmpty()
    @IsEnum(["PENDING", "APPROVED", "REJECTED"], {
        message: 'valid status is required'
    })
    status!: "PENDING"| "APPROVED" | "REJECTED"
}