import app from './src/app.js';

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Forgeworks Studio running at http://localhost:${port}`);
});
