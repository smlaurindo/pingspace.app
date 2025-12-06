import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@/config/config.module";
import { ConfigService } from "@/config/config.service";

/**
 * Create a test module with ConfigModule configured
 * Useful when you need to inject ConfigService in tests
 *
 * @example
 * ```typescript
 * const module = await createTestModuleWithConfig();
 * const configService = module.get(ConfigService);
 * const dbUrl = configService.get("database.url", { infer: true });
 * ```
 */
export async function createTestModuleWithConfig(): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ envFilePath: ".env.test" })],
    providers: [ConfigService],
  }).compile();
}

/**
 * Get ConfigService instance for tests
 *
 * @example
 * ```typescript
 * const configService = await getTestConfigService();
 * const dbUrl = configService.get("database.url", { infer: true });
 * ```
 */
export async function getTestConfigService(): Promise<ConfigService> {
  const module = await createTestModuleWithConfig();
  return module.get(ConfigService);
}
