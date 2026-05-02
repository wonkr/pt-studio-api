import { IsUUID } from "class-validator"

export class SwitchOrgDto {
    @IsUUID()
    orgTrainerId!: string;
}