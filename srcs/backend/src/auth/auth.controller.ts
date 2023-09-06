import { 
            Controller, 
            Post, 
            Body, 
            Req, 
            Get,
} from '@nestjs/common';
// import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto';
import axios from 'axios';
// import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
    constructor (
        private authService: AuthService,
        private prisma: PrismaService,
        // private config: ConfigService
    ) {}
    
   // POST /auth/signup
    @Post('signup')
    signup(@Body() dto: SignUpDto) {
        return this.authService.signup(dto);
    }

    // POST /auth/signin
    @Post('signin')
    signin(@Body() dto: SignInDto) {
        return this.authService.signin(dto);
    }

    @Get('token')
    async token(@Req() req: any) {
        return this.authService.signToken42(req);
    }
//     const code = req.query['code'];
//     const token = await this.exchangeCodeForToken(code);
//     if (token) {
//       const userInfo = await this.getUserInfo(token);
//       console.log('User Info:', userInfo);
//       // Handle the response data here, such as saving the user info or other data.
//     } else {
//       console.error('Failed to fetch access token');
//       // Handle errors here
//     }
//   }

//   private async exchangeCodeForToken(code: string): Promise<string | null> {
//     try {
//       const response = await axios.post('https://api.intra.42.fr/oauth/token', null, {
//         params: {
//           grant_type: 'authorization_code',
//           client_id: process.env.UID_42,
//           client_secret: process.env.SECRET_42,
//           code: code,
//           redirect_uri: 'http://localhost:4000/api/auth/token',
//         },
//       });
//       return response.data.access_token;
//     } catch (error) {
//       console.error('Error fetching access token:', error);
//       return null;
//     }
//   }

//   private async getUserInfo(token: string): Promise<any> {
//     try {
//       const response = await axios.get('https://api.intra.42.fr/v2/me', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//     //   return response.data;
//     // if ()
//     this.saveUserToDatabase(response.data);
//     } catch (error) {
//       console.error('Error fetching user info:', error);
//       throw error;
//     }
//   }

//   // Function to save user information in the database
//     async saveUserToDatabase(userInfo: any): Promise<void> {
//         // const prisma = new PrismaClient();
//     try {
//         const user = await this.prisma.user.create({
//             data: {
//             id: userInfo.id,
//             hashPassword: 'x',
//             username: userInfo.login,
//             email: userInfo.email,
//             firstName: userInfo.first_name,
//             lastName: userInfo.last_name,
//             // profilePic: userInfo.image.link,
//         },
//     });
//          console.log(user);
//     } catch (error) {
//         console.error('Error saving user information to database:', error);
//         throw error;
//     }
//     }
}

