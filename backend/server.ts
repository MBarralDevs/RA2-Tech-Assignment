import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(3001, () => console.log('Node running at http://localhost:3001'));
