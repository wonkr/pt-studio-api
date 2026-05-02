import { IsEnum, IsNotEmpty, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class OrganizationJoinRequestDto {
    @ApiProperty({ example: 'Pilates One', description: 'Organization name' })
    @IsNotEmpty()
    @IsUUID()
    organizationId!: string

    @ApiProperty({ example: 'TRAINER', enum: ['ADMIN', 'TRAINER'] })
    @IsNotEmpty()
    @IsEnum(["ADMIN", "TRAINER"], {
        message: 'valid status is required'
    })
    role!: "ADMIN"| "TRAINER"
}