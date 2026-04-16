import { CreateTrainerExpenseDto } from "./create-trainer-expense.dto";
import { PartialType } from "@nestjs/mapped-types"

export class UpdateTrainerExpenseDto extends PartialType(CreateTrainerExpenseDto) {}