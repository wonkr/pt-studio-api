import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class OrgGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user){
      throw new InternalServerErrorException(
        'OrgGuard requires AuthGuard to be applied first.'
      )
    }

    const trainerId = request.user.sub;
    const tokenOrgId = request.user.organizationId;

    if (!tokenOrgId) {
      throw new ForbiddenException({
        statusCode: 403,
        errorCode: 'ORG_CONTEXT_REQUIRED',
        message: 'Org context is required. Call /auth/switch-org first.',
      });
    }

    const urlOrgId = request.params?.orgId;
    if (urlOrgId && urlOrgId !== tokenOrgId) {
      throw new ForbiddenException({
        statusCode: 403,
        errorCode: 'ORG_CONTEXT_MISMATCH',
        message: 'Token org context does not match the requested org.',
        requiredOrgId: urlOrgId,
      });
    }

    const organization = await this.db.organizationTrainer.findFirst({
      where: { 
        trainerId: trainerId,
        organizationId: tokenOrgId,
        status: 'APPROVED' 
      }
      ,
      select: {
        role: true,
        organization: {
          select: { id: true, name: true },
        }
      }
    });

    if (!organization){
      throw new ForbiddenException({
        statusCode: 403,
        errorCode: 'NO_ORG_ACCESS',
        message: 'You do not have approved access to this organization.',
      });
    }

    request.org = {
      id: tokenOrgId,
      name: organization.organization.name,
      role: organization.role
    }
    return true;
  }
}