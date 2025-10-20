import { Global, Module } from "@nestjs/common";
import {
  ConfigModuleOptions,
  ConfigModule as NestConfigModule,
} from "@nestjs/config";
import { ConfigService } from "./config.service";
import { configuration } from "./configuration";

export type Configuration = {
  database: {
    url: string;
  };
  jwt: {
    privateKey: string;
    publicKey: string;
    expiration: string;
  };
  cryptography: {
    hashSalt: number;
  };
  app: {
    port: number;
    environment: string;
    cors: {
      origin: string;
    };
  };
};

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends NestConfigModule {
  static override forRoot(options: ConfigModuleOptions = {}) {
    // eslint-disable-next-line prefer-const
    let { envFilePath, ...otherOptions } = options;

    if (!envFilePath) {
      switch (process.env.NODE_ENV) {
        case "production": {
          envFilePath = ".env";
          break;
        }
        case "development": {
          envFilePath = ".env.development";
          break;
        }
        case "test": {
          envFilePath = ".env.test";
          break;
        }
        default: {
          envFilePath = ".env";
          break;
        }
      }
    }

    return super.forRoot({
      isGlobal: true,
      envFilePath,
      load: [configuration],
      ...otherOptions,
    });
  }
}
