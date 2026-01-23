import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { FilesModule } from './files/files.module';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log('\n=== INITIALIZING DATABASE CONNECTION ===');

        const dbConfig = {
          type: 'mysql' as const,
          host: configService.get('DB_HOST', 'localhost'),
          port: parseInt(configService.get('DB_PORT', '3306'), 10),
          username: configService.get('DB_USERNAME', 'root'),
          password: configService.get('DB_PASSWORD', ''),
          database: configService.get('DB_DATABASE', 'weos'),
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
          connectTimeout: 10000,
          acquireTimeout: 10000,
          timeout: 10000,
          retryAttempts: 3,
          retryDelay: 3000,
        };

        console.log('DB_HOST:', dbConfig.host);
        console.log('DB_PORT:', dbConfig.port);
        console.log('DB_USERNAME:', dbConfig.username);
        console.log('DB_DATABASE:', dbConfig.database);
        console.log('NODE_ENV:', configService.get('NODE_ENV'));
        console.log('Synchronize:', dbConfig.synchronize);
        console.log('Connection timeout:', dbConfig.connectTimeout, 'ms');
        console.log('Attempting to connect to database...\n');

        return dbConfig;
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    EventsModule,
    FilesModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
