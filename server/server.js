const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('Here');
  res.json({ message: 'Error' });

});

app.get('/users', (req, res) => {
  res.send('User list');
})

app.listen(8000);

