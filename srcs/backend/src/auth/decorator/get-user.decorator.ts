import {
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
    (
        data: string | undefined,
        ctx: ExecutionContext,
    ) => {
        const request: Express.Request = ctx
            .switchToHttp()
            .getRequest();
        
        const userData: any = request.user; // Assume the `User` type is defined elsewhere
        if (data && userData) {
            return userData[data];
        }
        return request.user;
    },
);