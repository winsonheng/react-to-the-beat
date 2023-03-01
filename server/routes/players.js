const express = require('express');
const router = express.Router();
const Player = require('../models/player');

router.get('/:id', getPlayer, (req, res) => {
  res.send(res.player.name);
});

router.get('/', getPlayer, (req, res) => {
  res.json(res.player);
})

router.post('/', async (req, res) => {
  const player = new Player({
    name: req.body.name,
    highscores: req.body.highscores
  });

  console.log('POST this player: ', player);

  try {
    const newPlayer = await player.save();
    res.status(200).json(newPlayer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/', (req, res) => {
  console.log('PATCH using cookies', req.body, req.cookies, req.body.score);
});

router.delete('/:id', (req, res) => {

});

async function getPlayer(req, res, next) {
  let player;
  try {
    console.log(req.cookies === {});
    if (req.cookies != null) {
      console.log('GET player using cookies: ', req.cookies);
      player = await Player.findOne({name: req.cookies.name});
      console.log(player);
    } else {
      console.log('GET player using id: ', req.params.id);
      player = await Player.findById(req.params.id);
    }

    if (player == null) {
      return res.status(404).json({ message: 'Cannot find player' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.player = player;
  next();
}

module.exports = router;