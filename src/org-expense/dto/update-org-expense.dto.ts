import { CreateOrgExpenseDto } from "./create-org-expense.dto";
import { PartialType } from "@nestjs/mapped-types"

export class UpdateOrgExpenseDto extends PartialType(CreateOrgExpenseDto) {}