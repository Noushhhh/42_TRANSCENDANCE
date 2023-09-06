import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import {UserService} from './user.service'
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module ({
    imports: [CloudinaryModule],
    controllers: [UserController],
    providers: [UserService ]
 })
export class UserModule {}