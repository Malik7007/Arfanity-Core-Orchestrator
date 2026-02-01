import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const DB_FILE = path.join(__dirname, 'db.json');

// Ensure uploads directory exists
await fs.mkdir(UPLOADS_DIR, { recursive: true });

// Initialize DB if not exists
try {
    await fs.access(DB_FILE);
} catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ documents: [] }));
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

async function getDB() {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

async function saveDB(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/documents', async (req, res) => {
    try {
        const db = await getDB();
        res.json(db.documents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const { file } = req;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        let content = '';
        const ext = path.extname(file.originalname).toLowerCase();

        if (ext === '.pdf') {
            const dataBuffer = await fs.readFile(file.path);
            const data = await pdf(dataBuffer);
            content = data.text;
        } else if (ext === '.docx' || ext === '.doc') {
            const dataBuffer = await fs.readFile(file.path);
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            content = result.value;
        } else {
            content = await fs.readFile(file.path, 'utf-8');
        }

        console.log(`[DB] Extracted ${content.length} chars from ${file.originalname}`);
        if (content.length === 0) console.warn(`[WARN] No content extracted from ${file.originalname}`);

        const newDoc = {
            id: `db-${Date.now()}`,
            name: file.originalname,
            content: content,
            classification: 'Internal',
            source: 'Upload',
            lastSynced: new Date().toLocaleString(),
            filePath: file.path
        };

        const db = await getDB();
        db.documents.push(newDoc);
        await saveDB(db);

        res.json(newDoc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/paste', async (req, res) => {
    try {
        const { name, content } = req.body;
        const newDoc = {
            id: `db-${Date.now()}`,
            name: name || 'Pasted Content',
            content: content,
            classification: 'Internal',
            source: 'Paste',
            lastSynced: new Date().toLocaleString()
        };

        const db = await getDB();
        db.documents.push(newDoc);
        await saveDB(db);

        res.json(newDoc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/documents/:id', async (req, res) => {
    try {
        const db = await getDB();
        const doc = db.documents.find(d => d.id === req.params.id);
        if (doc && doc.filePath) {
            try {
                await fs.unlink(doc.filePath);
            } catch (e) {
                console.error('Failed to delete file:', e);
            }
        }
        db.documents = db.documents.filter(d => d.id !== req.params.id);
        await saveDB(db);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
