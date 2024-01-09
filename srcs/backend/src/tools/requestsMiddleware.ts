import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BrowserCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'];

    if (!userAgent) return;

    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome')) {
      throw new BadRequestException("Request blocked", { cause: new Error(), description: "request must come from one of those browers : Brave, Chrome, Mozilla" })
    }

    next();
  }
}
