import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OrgRole = createParamDecorator(
  (_data, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.org?.role;
  },
);