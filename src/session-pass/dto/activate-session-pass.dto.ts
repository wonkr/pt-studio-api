import { IsBoolean, IsNotEmpty } from "class-validator"

export class ActivateSessionPassDto {
    @IsNotEmpty()
    @IsBoolean()
    isActivated!: boolean
}