import 'dotenv/config';
import "./src/config/paystack.js";
import app from './src/app.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`QuickServe API listening on port ${PORT}`);
});