import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/auth/exception/all-exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import { SessionService } from '../src/auth/session.service';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    beforeAll( async () => {
        const moduleRef = await Test.createTestingModule({
            imports:[AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        const sessionService = app.get(SessionService);

        // Use the ValidationPipe to validate incoming requests
        app.useGlobalPipes(
          new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: {
              enableImplicitConversion: true,
            },
          })
        );
      
        // Configure CORS (Cross-Origin Resource Sharing) options
        const corsOptions: CorsOptions = {
          origin: '*',
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          allowedHeaders: [
            'Content-Type',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
            'x-user-id',
          ],
          optionsSuccessStatus: 200,
          credentials: true,
        };
        
        // Enable CORS for all routes in the application
        app.enableCors(corsOptions);
        
        // Use express.json middleware to parse incoming JSON payloads
        // set a large limit to avoid server crash for large body request
        app.use(express.json({limit: '50mb'}));
        app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
        
        // Use cookie-parser middleware to parse incoming cookies
        app.use(cookieParser());
        
        // Set a global route prefix for the application
        app.setGlobalPrefix('api');
      
        // Use the AllExceptionsFilter to handle exceptions globally
        app.useGlobalFilters(app.get(AllExceptionsFilter));
      
        // Serve static files from the 'uploads' folder
        app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
      
        //make sure all the Expired sessions are deleted from the data base, this job will be executed every minute
        cron.schedule('* * * * *', async () => {
          await sessionService.clearExpiredSessions();
        });
    
        await app.init();
        await app.listen(3333);

        prisma = app.get(PrismaService);

        await prisma.cleanDb();
        pactum.request.setBaseUrl("http://localhost:3333");
    })
    afterAll(() => {
        app.close();
    })

    describe('Auth', () => {

      let userAccessToken: string = "";

      const authDto: AuthDto = {
        username: 'polo',
        password: 'my-password',
      }
    
      describe('Signup', () => {

        it("should signup", () => {
          return pactum.spec().post('/api/auth/signup').withBody(authDto).expectStatus(201);
        });
      });


    describe('Chat', () => {

      it('should save token', async () => {
        let match: RegExpExecArray | null = null;
        const token = await pactum.spec().post('/api/auth/signin').withBody(authDto).expectStatus(200).returns((ctx) => {
          const cookies = ctx.res.headers['set-cookie'];
          if (!cookies)
            return null;
          const tokenRegex = /token=([^;]+)/;
          for (const cookie of cookies) {
            match = tokenRegex.exec(cookie);
            if (match) {
              return match[1];
            }
          }
          return null;
      });
        if (match !== null) {
          userAccessToken = `${token}`;
        }
      })
      it('should get me and store userId', () => {
        return pactum
          .spec()
          .get(`/api/users/me`)
          .withCookies('token', `${userAccessToken}`)
          .expectStatus(200)
          .stores('userId', 'id')
          .inspect();
      });

      it('get All conv from id', () => {
        return pactum
          .spec()
          .post('/api/chat/getAllConvFromId')
          .withBody({userId: '$S{userId}'})
          .withCookies('token', `${userAccessToken}`)
          .inspect()
          .expectStatus(201)
      })
    })

})});