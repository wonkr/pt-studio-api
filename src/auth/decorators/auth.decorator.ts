import { createParamDecorator, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

export const TrainerId = createParamDecorator(
  (_data, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const trainerId = request.user?.sub;
    if (!trainerId) {
      throw new UnauthorizedException('Invalid token: missing trainerId');
    }
    return trainerId;
  },
);

export const OrgId = createParamDecorator(
  (_data, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.organizationId;
  },
);

export const RequiredOrgId = createParamDecorator(
  (_data, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const orgId = request.user?.organizationId;
    if (!orgId) {
      throw new ForbiddenException('Organization context required');
    }
    return orgId;
  },
);