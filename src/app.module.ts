import { McpApp, Module, ConfigModule } from '@nitrostack/core';

@McpApp({
  module: AppModule,
  server: {
    name: 'huggingdex-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root application module',
  imports: [
    ConfigModule.forRoot()
  ]
})
export class AppModule {}
