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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary modules and dependencies
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Define the bootstrap function
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a NestJS application instance with the AppModule and NestExpressApplication type
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        // Use the ValidationPipe globally with the whitelist option enabled
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
        }));
        // Define CORS options
        const corsOptions = {
            origin: 'http://localhost:8080',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: ['Content-Type', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
            optionsSuccessStatus: 200,
            credentials: true,
        };
        // Enable CORS with the specified options
        app.enableCors(corsOptions);
        // Use the cookie-parser middleware
        app.use((0, cookie_parser_1.default)());
        // Set the global prefix for the API routes
        app.setGlobalPrefix('api');
        // Serve static files from the 'uploads' folder with the '/uploads' prefix
        app.useStaticAssets('uploads', { prefix: '/uploads' });
        // Start the application on port 4000
        yield app.listen(4000);
    });
}
// Call the bootstrap function to start the application
bootstrap();
