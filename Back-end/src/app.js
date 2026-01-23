import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";
import helmet from "helmet";
import { connectDB } from './config/database/db.js';
import router from './routes/auth.routes.js';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());


// Serve static files from the 'public' directory (located at Back-end/public)
app.use(express.static(path.join(__dirname, '../public')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// database connection
connectDB();

// routes

app.use('api/v1/auth',router)
