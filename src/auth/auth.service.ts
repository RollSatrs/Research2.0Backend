import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { usersTable } from 'src/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { LoginDto } from './dto/login.dto';
import { db } from 'src';

@Injectable()
export class AuthService {
  async register(dto: RegisterDto) {
    console.log("register")
    try {
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
      if (err.code === '23505') {
        throw new UnauthorizedException('Email уже используется'); // 401
      }
      throw new BadRequestException('Не удалось зарегистрировать пользователя')
    }
  }

  async login(dto: LoginDto) {
    try {

    } catch (err) {

    }
  }
}
