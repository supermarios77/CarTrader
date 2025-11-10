import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchServiceEnv } from '../../config/environment';

@Module({
  imports: [ConfigModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    {
      provide: Client,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<SearchServiceEnv>): Client => {
        const node = configService.get('OPENSEARCH_NODE', { infer: true });
        const username = configService.get('OPENSEARCH_USERNAME', { infer: true });
        const password = configService.get('OPENSEARCH_PASSWORD', { infer: true });

        if (!node || !username || !password) {
          throw new Error('OpenSearch configuration is incomplete');
        }

        return new Client({
          node,
          auth: {
            username,
            password,
          },
        });
      },
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
