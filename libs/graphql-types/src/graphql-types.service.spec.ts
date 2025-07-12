import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlTypesService } from './graphql-types.service';

describe('GraphqlTypesService', () => {
  let service: GraphqlTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphqlTypesService],
    }).compile();

    service = module.get<GraphqlTypesService>(GraphqlTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
