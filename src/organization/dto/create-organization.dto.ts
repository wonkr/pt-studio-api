import { IsArray, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer";

class CreateRoomDto {
    @ApiProperty({ example: 'Room A', description: 'Name of the room' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: 10, description: 'Maximum number of participants allowed in the room' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(100)
    capacity!: number;
}

export class CreateOrganizationDto {
    @ApiProperty({ example: 'Pilates One', description: 'Organization name' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: 'Apgujeong-ro', description: 'Organization address' })
    @IsNotEmpty()
    @IsString()
    address!: string;

    @ApiProperty({ example: 1, description: 'Total number of rooms in the organization' })
    @IsInt()
    @Min(1)
    @Max(100)
    roomCount!: number;

    @ApiProperty({ type: [CreateRoomDto], description: 'List of rooms in the organization' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRoomDto)
    rooms!: CreateRoomDto[];
}