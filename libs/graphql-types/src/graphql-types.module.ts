import { Module } from '@nestjs/common';
import { GraphqlTypesService } from './graphql-types.service';

@Module({
  providers: [GraphqlTypesService],
  exports: [GraphqlTypesService],
})
export class GraphqlTypesModule {}
