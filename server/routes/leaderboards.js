const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/leaderboard');

router.get('/:id', (req, res) => {
  console.log(req.params.id);
});

router.post('/', (req, res) => {

});

router.patch('/:id', (req, res) => {

});

router.delete('/:id', (req, res) => {

});

module.exports = router;