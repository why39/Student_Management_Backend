import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthResponse } from './dto/auth-response';
import { UsersService } from '../users/users.service';
import { BadRequestException } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerInput: RegisterInput) {
    // Check if email is already taken
    const existingUser = await this.usersService.findByEmail(registerInput.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash the password
    const hashedPassword = await this.authService.hashPassword(registerInput.password);

    // Create new user
    const newUser = await this.usersService.create({
      ...registerInput,
      password: hashedPassword,
    });

    return this.authService.login(newUser);
  }
}