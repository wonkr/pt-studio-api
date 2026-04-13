import { CreateSessionPassDto } from "./create-session-pass.dto";
import { PartialType } from "@nestjs/mapped-types"

export class UpdateSessionPassDto extends PartialType(CreateSessionPassDto) {}