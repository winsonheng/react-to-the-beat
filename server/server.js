require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

const cors=require("cors");
const corsOptions ={
   origin: process.env.ALLOW_ORIGIN_HEADER, 
   credentials: true,
   optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));

app.use(express.json());

const leaderboardRouter = require('./routes/leaderboards');
app.use('/leaderboards', leaderboardRouter);

const playerRouter = require('./routes/players');
app.use('/players', playerRouter);

app.get('/', (req, res) => {
  console.log('GET request on root dir to obtain cookie');
  res.cookie('name', 'express').json({ message: 'cookie set' });
});

app.post('/', (req, res) => {
  console.log('Cookies: ', req.cookies);
});


app.listen(8000, () => console.log('Server has started'));

