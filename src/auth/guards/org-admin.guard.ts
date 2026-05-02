import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class OrgAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAdminPath = request.path.includes('/admin');
    
    if (!isAdminPath){
        return true
    }
    
    if (!request.org) {
      throw new InternalServerErrorException(
        'OrgAdminGuard requires OrgGuard to be applied first.'
      );
    }

    const orgId = request.params.orgId
    const tokenOrgId = request.org.id
    const tokenOrgRole = request.org.role

    if (orgId === tokenOrgId && ['ADMIN', 'OWNER'].includes(tokenOrgRole)){
        return true
    } else {
        throw new ForbiddenException({
        statusCode: 403,
        errorCode: 'INSUFFICIENT_ROLE',
        message: 'Admin or Owner role required.',
      });
    }
  }
}