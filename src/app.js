import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import routes from './routes/index.js';
import notFoundMiddleware from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import requestContextMiddleware from './middlewares/requestContext.middleware.js';
import requestLoggerMiddleware from './middlewares/requestLogger.middleware.js';
import rateLimitMiddleware from './middlewares/rateLimit.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
// Middleware - security
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({
    extended: false,
    limit: '16kb',
    parameterLimit: 100,
}));

// Middleware - request tracking
app.use(requestContextMiddleware);
app.use(requestLoggerMiddleware);
app.use(rateLimitMiddleware);

// Suppress common browser noise
app.get(['/favicon.ico', '/.well-known/appspecific/com.chrome.devtools.json', '/sw.js'], (req, res) => res.status(204).end());

// API Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// Root landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Routes
app.use('/', routes);

// Not found middleware
app.use(notFoundMiddleware);

// Global error handler
app.use(errorMiddleware);

export default app;
