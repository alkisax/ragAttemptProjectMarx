// backend\src\server.ts
/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app'; 

const PORT = process.env.BACK_END_PORT || 3001;

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

mongoose.set('strictQuery', false);
// συνδεση με την MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
    console.log('Routes setup complete. Starting server...');
    // εδώ είναι το βασικό listen PORT μου
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
      console.log(`Visit swagger at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('error connecting to MongoDB:', error.message);
  });