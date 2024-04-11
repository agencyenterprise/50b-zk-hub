import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import router from './router';
import { WorkerStatus, getAvailableWorkers } from './db/worker';
import axios from 'axios';

const app = express();

app.use(cors({
  credentials: true
}))

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));


const server = http.createServer(app);

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log('Server running on http://localhost:8080');
})

const MONGO_URL = 'mongodb+srv://admin:admin@cluster0.bocbhoy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.Promise = Promise
mongoose.connect(MONGO_URL)
mongoose.connection.on('error', (error: Error) => console.log(error))

app.use('/', router())

setInterval(async () => {
  const availableWorkers = await getAvailableWorkers()

  await Promise.allSettled(availableWorkers.map(async (worker): Promise<void> => {
    try {
      const response = await axios.get(`${worker.url}/healthcheck`, { timeout: 5000 })
      if (response.status && response.status === 200) {
        return
      }
    } catch (error) {}

    await worker.updateOne({ status: WorkerStatus.OFFLINE })
  }))
}, 5000);