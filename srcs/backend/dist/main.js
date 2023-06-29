"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a new NestJS application instance
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
        }));
        const corsOptions = {
            origin: 'http://localhost:8080',
            optionsSuccessStatus: 200, // Ajoutez ce code d'état pour les réponses pré-vol (preflight)
        };
        app.setGlobalPrefix("api");
        // Activez CORS pour toutes les routes de l'application
        app.enableCors(corsOptions);
        // app.setGlobalPrefix('api'); // set global route prefix
        // Start the application and listen on port 4000
        yield app.listen(4000);
    });
}
bootstrap();
