/* eslint-disable quotes */
/* eslint-disable no-console */
 
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
// import type { NextFunction } from 'express';
import path from 'path';
// import swaggerSpec from './utils/swagger';
// import swaggerUi from 'swagger-ui-express';
// import rateLimit from 'express-rate-limit';
// import helmet from 'helmet';

  // import scraperRoutes from './scraper/scraper.routes';
  import vectoriseRoutes from './vectorize/gptEmbeddingsParagraph.routes'
  import gptRagParagraphRoutes from './rag/gptRagParagraph.routes'
  import ragMemoryRoutes from './ragMemory/RagMemory.routes'



const app = express();

// const allowedOrigins = [
//   `${process.env.FRONTEND_URL}`,
//   `${process.env.BACKEND_URL}`,
//   `${process.env.DEPLOY_URL}`,
//   'https://cloud.appwrite.io', 
// ];
app.use(cors());
// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         return cb(null, true);
//       }
//       return cb(null, false); // simply reject without crashing
//     },
//     // credentials: true, // set true if you use cookies for auth
//   })
// );


app.use(express.json());

// // library for securing. With only helmet() covers: sniffing, clickjacking, HSTS
// // app.use(helmet());

// // το helmet() δεν μου επέτρεπε να δω τις εικόνες απο το appwrite ή να μπω στο stripe etc. Εδω προσθέτουμε εξαιρέσεις για αυτό
// // **ΠΡΟΣΟΧΗ** αυτη είναι η πιθανοτερη πηγη δυσλειτουργίας third party
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [
//         "'self'",
//         "https://js.stripe.com",
//         "https://www.googletagmanager.com",   // google analytics
//         "https://www.google-analytics.com",
//         "https://www.youtube.com",
//         "https://s.ytimg.com"        
//       ],
//       frameSrc: [
//         "'self'",
//         "https://js.stripe.com",
//         "https://www.google.com",
//         "https://maps.google.com",
//         "https://analytics.google.com",
//         "https://lookerstudio.google.com",
//         "https://www.youtube.com",
//         "https://youtube.com",
//         "https://www.youtube-nocookie.com" 
//       ],
//       // imgSrc: ["'self'", "data:", "https://cloud.appwrite.io", "https://fra.cloud.appwrite.io"], // αυτο λειτουργούσε αλλλα αφαιρέθηκε, **ΝΑ ΠΡΟΣΤΕΘΕΙ ΞΑΝΑ** δες επόμενο σχόλιο
//       imgSrc: [
//         "'self'",
//         "data:",
//         "https://i.ytimg.com",
//         "https://s.ytimg.com",
//         "https://cloud.appwrite.io",
//         "https://fra.cloud.appwrite.io",        
//         "https:"], // η εφαρμογή μου είχε πολλές φωτογραφίες απο διάφορα url απο το ιντερνετ. βάλαμε αυτό γιατί τις έκοβε το helmet αλλα τώρα δεν είναι ασφαλές
//       connectSrc: [
//         "'self'",
//         "https://cloud.appwrite.io",
//         "https://fra.cloud.appwrite.io",
//         "https://region1.google-analytics.com",
//         "https://www.google-analytics.com",
//         "https://www.youtube.com",
//         "https://youtube.com",
//         "https://*.googlevideo.com",
//         "https://*.ytimg.com",
//       ],
//       mediaSrc: [
//         "'self'",
//         "https://*.googlevideo.com",
//       ],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//     },
//   })
// );
// // needs or problems on deploy -helmet-
// app.set('trust proxy', 1);

// app.use((req: Request, _res: Response, next: NextFunction) => {
//   console.log("Request reached Express!");
//   console.log(`Incoming request: ${req.method} ${req.path}`);
//   next();
// });

// // global limiter η βιβλιοθήκε αυτή βάζει όριο στο πόσα req θα δεχτεί απο κάθε ip με αποτέλεσμα να εμποδίζει DDOS επιθέσεις
// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 200, // TODO CHANGE BACK!!!// 200 requests / 15 min per IP
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(globalLimiter);

app.get('/api/ping', (_req: Request, res: Response) => {
  console.log('someone pinged here');
  res.send('pong');
});

app.get('/health', (_req, res) => {
  res.send('ok');
});

// app.use("/api/scraper", scraperRoutes);
app.use('/api/vectorise', vectoriseRoutes)
app.use('/api/rag', gptRagParagraphRoutes)
app.use('/api/rag-memory', ragMemoryRoutes)

app.use(express.static('dist')); 

// // swagger test page
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ SERVE UPLOADS BEFORE DIST
// ΠΡΟΣΟΧΗ το ../ στο path είναι συμαντικο. τα αρχεια μας βρίσκονται τελικά στον φάκελο dist
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// για να σερβίρει τον φακελο dist του front μετα το npm run build
// app.use(express.static('dist'));
app.use(express.static(path.join(__dirname, '../public')));

//αυτο είναι για να σερβίρει το index.html του front όταν ο χρήστης επισκέπτεται το root path ή οποιοδήποτε άλλο path που δεν είναι api ή api-docs
app.get(/^\/(?!api|api-docs).*/, (_req, res) => {
  // res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

export default app;
