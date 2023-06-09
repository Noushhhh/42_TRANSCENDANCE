import { Injectable } from '@nestjs/common';

@Injectable() // Declare this class as an injectable service
export class AppService {
  getHello(): string {
    return 'ft_transcendance with the best team!';
  }
}