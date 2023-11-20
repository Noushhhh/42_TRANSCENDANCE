import { Test } from '@nestjs/testing';
import { AppModule  } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('App e2e', () => {
    let app: INestApplication;
    beforeAll( async () => {
        const moduleRef = await Test.createTestingModule({
            imports:[AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
    })
    it.todo("should pass");
    it.todo("should pass2");
})