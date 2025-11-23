import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {

    @IsNotEmpty({message:"Полное имя обязательно"})    
    fullname: string

    @IsEmail({}, { message: "Некорректный email" })
    email: string;
    
    @MinLength(6, { message: "Пароль должен быть не менее 6 символов" })
    password: string;

}
