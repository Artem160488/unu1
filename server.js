const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
  require('child_process').exec(`start http://localhost:${port}`);
});
