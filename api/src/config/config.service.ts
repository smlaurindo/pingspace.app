import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

import { Configuration } from "./config.module";

@Injectable()
export class ConfigService extends NestConfigService<Configuration, true> {
  get isProduction(): boolean {
    return this.get("app.environment", { infer: true }) === "production";
  }

  get isTest(): boolean {
    return this.get("app.environment", { infer: true }) === "test";
  }

  get isDevelopment(): boolean {
    return this.get("app.environment", { infer: true }) === "development";
  }

  get database(): Configuration["database"] {
    return this.get("database");
  }

  get jwt(): Configuration["jwt"] {
    return this.get("jwt");
  }

  get cryptography(): Configuration["cryptography"] {
    return this.get("cryptography");
  }
}
