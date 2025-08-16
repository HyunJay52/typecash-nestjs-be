import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

export class PrismaService
    extends PrismaClient<
        Prisma.PrismaClientOptions,
        'query' | 'info' | 'error' | 'warn'
    >
    implements OnModuleInit
{
    private readonly logger = new Logger(PrismaService.name);
    constructor(private readonly configService: ConfigService) {
        super({
            log: [
                { emit: 'stdout', level: 'query' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
        });
    }
    async onModuleInit() {
        try {
            // const databaseUrl = this.configService.get<string>('DATABASE_URL');
            // if (!databaseUrl) {
            //   throw new Error('DATABASE_URL is not defined in the configuration');
            // }
            // this.$on('error', (event) => {
            //   this.logger.verbose(event.target);
            // });
            await this.$connect();
            this.logger.log('✅ Connected to the database successfully');
        } catch (error) {
            this.logger.error('Error connecting to the database:', error);
        }
    }
}
