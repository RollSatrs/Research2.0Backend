import { BadRequestException, CanActivate, ExecutionContext, HttpException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export class JwtAuth implements CanActivate{
    constructor(private jwt: JwtService){}

    async canActivate(context: ExecutionContext){
        const request = context.switchToHttp().getRequest<Request>()
        const token = request.headers.authorization?.split(' ')[1]
        if(!token){throw new UnauthorizedException({
            error: "",
            message: "Нет токена"
        })}
        try{
            const payload = await this.jwt.verifyAsync(token)
            request.accessToken = payload
        }catch(err){
            console.log("ERROR: ", err)
            if (err instanceof HttpException) {
                throw err;
            }
            throw new BadRequestException({
                error: "LOGIN_FAILED",
                message: "Не удалось выполнить вход. Проверьте данные и попробуйте снова."
            });
        }
    }
}