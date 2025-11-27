import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'
import { usersTable } from 'src/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { LoginDto } from './dto/login.dto';
import { db } from 'src';
import { eq } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService
  ){}
  async register(dto: RegisterDto) {
    console.log("register")
    try {
      const result = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, dto.email))
        .limit(1)

      const existingUser = result[0]

      if (existingUser) {
        throw new UnauthorizedException({
          error: "EMAIL_EXISTS",
          message: "Пользователь с таким email уже зарегистрирован. Пожалуйста, войдите в систему."
        });
      }
      const hashedPassword = await bcrypt.hash(dto.password, 10)
      const user: typeof usersTable.$inferInsert = {
        fullname: dto.fullname,
        email: dto.email,
        password: hashedPassword
      }

      await db.insert(usersTable).values(user)
      return ({ message: "Регистрация ок" })
    } catch (err) {
      console.log("REGISTER ERROR:", err)


      if (err instanceof HttpException) {
        throw err;
      }
      throw new BadRequestException({
        error: "REGISTRATION_FAILED",
        message: "Не удалось зарегистрировать пользователя. Пожалуйста, попробуйте снова."
      });
    }
  }

  async login(dto: LoginDto) {
    console.log("login")
    try {
      const result = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, dto.email))
        .limit(1)

      const user = result[0]

      const payload = {
        sub: user.id,
        email: user.email
      }

      const secret = this.config.get<string>('JWT_SECRET', 'secret')
      const token = this.jwt.signAsync(payload,{
        secret,
        expiresIn: '7d'
      })
      if (!user) {
        throw new UnauthorizedException({
          error: "EMAIL_NOT_FOUND",
          message: "Пользователь с таким email не существует"
        });
      }
      const isMatch = await bcrypt.compare(dto.password, user.password);

      if (!isMatch) {
        console.log('Неверный пароль')
        throw new UnauthorizedException({
          error: "INVALID_PASSWORD",
          message: "Неверный пароль"
        });
      }
      return {
        message: "Успешный вход",
        access_token: token
      }; // 200
    } catch (err) {
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
