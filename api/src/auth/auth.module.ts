import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule, type JwtSignOptions } from "@nestjs/jwt";
import { ConfigModule } from "@/config/config.module";
import { ConfigService } from "@/config/config.service";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./guards/auth.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => {
        const privateKey = configService.jwt.privateKey;
        const publicKey = configService.jwt.publicKey;
        const jwtExpiration = configService.jwt.expiration;

        return Promise.resolve({
          signOptions: {
            algorithm: "RS256",
            allowInsecureKeySizes: !configService.isProduction,
            expiresIn: jwtExpiration as JwtSignOptions["expiresIn"],
          },
          privateKey: Buffer.from(privateKey, "base64"),
          publicKey: Buffer.from(publicKey, "base64"),
        });
      },
    }),
    DrizzleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [AuthService],
})
export class AuthModule {}
