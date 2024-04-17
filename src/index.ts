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
import config from './config/index';

const app = express();

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
}))

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));

const server = http.createServer(app);

const port = config.PORT

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
})

const MONGO_URL = process.env.MONGO_URL

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
      } else {
        console.log(response.status)
        console.log(`Worker ${worker.url} is offline`)
      }
    } catch (error) {
      console.log(`Worker ${worker.url} is offline`)
      console.log(error)
    }

    await worker.updateOne({ status: WorkerStatus.OFFLINE })
  }))
}, 20000);