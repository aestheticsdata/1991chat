import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  @MaxLength(64)
  username!: string;

  @IsString()
  @MaxLength(200)
  password!: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: "username may only contain letters, numbers, and _ . -",
  })
  username!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(200)
  password!: string;
}
