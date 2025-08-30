import { SetMetadata } from "@nestjs/common"

export const PERMISSION_KEY = 'permissions'

export const RequiredPermissions = (...permissions:string[]) =>{
    return SetMetadata(PERMISSION_KEY, permissions);
}

export const RequiredAnyPermissions = (...permissions:string[]) =>{
    return SetMetadata(PERMISSION_KEY, {type:'any',permissions});
}
export const RequiredAllPermissions = (...permissions:string[]) =>{
    return SetMetadata(PERMISSION_KEY, {type:'all',permissions});
}


