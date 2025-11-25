import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { usersTable } from 'src/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { LoginDto } from './dto/login.dto';
import { db } from 'src';
import { eq } from 'drizzle-orm';

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
    console.log("login")
    try {
      const result = await db.select()
        .from(usersTable)
        . where(eq(usersTable.email, dto.email))
        .limit(1)

      const user = result[0]
      if(!user){
        throw new UnauthorizedException('Email не найден');
      }
        const isMatch = await bcrypt.compare(dto.password, user[0].password);

      if (!isMatch) {
        throw new UnauthorizedException('Неверный пароль'); // 401
      }
    
      return { message: 'Успешный вход' }; // 200
    } catch (err) {
      console.log("ERROR: ",err)
      throw new BadRequestException("ошибка лютая")
    }
  }
}
