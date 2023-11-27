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
import { Req } from '@nestjs/common';
import { UserIdDto } from '../src/users/dto';
import { CreateChannelDto } from '../src/chat/chat.controller';

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
          origin: 'http://localhost:8081',
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
          // console.log("Cron job executed every minute");
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
      const emptyPasswordDto: AuthDto = {
        username: '           ',
        password: '',
      }
      const emptyUsernameDto: AuthDto = {
        username: '',
        password: '          ',
      }
      const bothPasswordUsernameEmpty: AuthDto = {
        username: '',
        password: '          ',
      }
      const authDto: AuthDto = {
        username: 'polo',
        password: '          ',
      }
      
    
      describe('Signup', () => {

        it("should throw exception", () => {
          return pactum.spec().post('/api/auth/signup').withBody(emptyPasswordDto).expectStatus(400);
        });

        it("should throw exception", () => {
          return pactum.spec().post('/api/auth/signup').withBody(emptyUsernameDto).expectStatus(400);
        });

        it("should throw exception", () => {
          return pactum.spec().post('/api/auth/signup').withBody({username: authDto.username}).expectStatus(400);
        });

        it("should throw exception", () => {
          return pactum.spec().post('/api/auth/signup').withBody({password: authDto.password}).expectStatus(400);
        });

        it("should throw exception", () => {
          return pactum.spec().post('/api/auth/signup').withBody(bothPasswordUsernameEmpty).expectStatus(400);
        });

        it("should signup", () => {
          return pactum.spec().post('/api/auth/signup').withBody(authDto).expectStatus(201);
        });
      });

      describe('Signin', () => {
        
        it("shoud signin and store cookies", async () => {

          /*const token = await pactum
            .spec()
            .post('/api/auth/signin')
            .withBody(authDto)
            .expectStatus(200)
            .returns((ctx) => {
              const cookies = ctx.res.headers['set-cookie'];
              if (!cookies)
                return null;
              const tokenRegex = /token=([^;]+)/;
              for (const cookie of cookies) {
                const match = tokenRegex.exec(cookie);
                if (match) {
                  return match[1];
                }
              }
              return null; // Retourne null si le token n'est pas trouvé
          });*/

        
      });

    });
    describe('User', () => {
      describe('Get me', () => {});
    });

    describe('Chat', () => {
      it('should create channel', async () => {
        const createChannel: CreateChannelDto = {
          name:'awdawd',
          password:'awdawdawd',
          ownerId:0,
          participants: [0],
          type: 'PUBLIC'
        }
        const token = await pactum
              .spec()
              .post('/api/auth/signin')
              .withBody(authDto)
              .expectStatus(200)
              .returns((ctx) => {
                const cookies = ctx.res.headers['set-cookie'];
                if (!cookies)
                  return null;
                const tokenRegex = /token=([^;]+)/;
                for (const cookie of cookies) {
                  const match = tokenRegex.exec(cookie);
                  if (match) {
                    return match[1];
                  }
                }
                return null; // Retourne null si le token n'est pas trouvé
            });
          console.log('output == ');
          console.log('output == ');
          console.log('output == ');
          console.log('output == ');
          console.log('output == ');
          console.log('output == ');
          console.log(token);
          return pactum.spec().post("/api/chat/addChannelToUser").withBody(createChannel).expectStatus(200).withCookies('token', `${token}`);
      })
    })

})});