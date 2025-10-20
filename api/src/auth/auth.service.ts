import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import {
  DrizzleAsyncProvider,
  type DrizzleDatabase,
} from "@/drizzle/drizzle.provider";
import {
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  SignInResponse,
} from "./auth.dto";
import { ConfigService } from "@/config/config.service";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { UserAlreadyExistsException } from "./exceptions/user-already-exists.exception";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  NumberDictionary,
} from "unique-names-generator";
import { InvalidCredentialsException } from "./exceptions/invalid-credentials.exception";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: DrizzleDatabase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(request: SignUpRequest): Promise<SignUpResponse> {
    const { email, password } = request;

    const user = await this.db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.email, email),
    });

    if (user) {
      throw new UserAlreadyExistsException();
    }

    const salt = this.configService.get("cryptography.hashSalt", {
      infer: true,
    });

    const hashedPassword = await bcrypt.hash(password, salt);

    const randomNickname: string = uniqueNamesGenerator({
      dictionaries: [
        colors,
        adjectives,
        animals,
        NumberDictionary.generate({ min: 10, max: 9999 }),
      ],
      style: "capital",
      separator: "",
      length: 4,
    });

    const [newUser] = await this.db
      .insert(users)
      .values({
        nickname: randomNickname,
        email,
        passwordHash: hashedPassword,
      })
      .returning({ id: users.id });

    const accessToken = await this.jwtService.signAsync({ sub: newUser.id });

    return { accessToken };
  }

  async signIn(request: SignInRequest): Promise<SignInResponse> {
    const { email, password } = request;

    const user = await this.db.query.users.findFirst({
      columns: { id: true, passwordHash: true },
      where: eq(users.email, email),
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const accessToken = await this.jwtService.signAsync({ sub: user.id });

    return { accessToken };
  }
}
