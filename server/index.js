import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// Example API route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' })
})

const staticPath = path.join(__dirname, '../dist');
app.use(express.static(staticPath));

// Handle SPA routing by sending index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
