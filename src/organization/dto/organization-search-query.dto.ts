import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator"

export class OrganizationSearchQueryDto {
    @ApiProperty({ example: 'Pilates One', description: 'Organization name' })
    @IsNotEmpty()
    @IsString()
    name!: string;
}