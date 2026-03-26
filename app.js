const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

dotenv.config();

const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const { isMongoEnabled } = require('./config/db');
const { injectGlobals } = require('./middleware/globalMiddleware');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const rideRoutes = require('./routes/rideRoutes');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = 'http://localhost';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'goride-dev-secret',
    resave: false,
    saveUninitialized: false,
    ...(isMongoEnabled
      ? {
          store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions'
          })
        }
      : {}),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true
    }
  })
);

app.use(flash());
app.use(injectGlobals);

app.get('/', (req, res) => {
  console.log('GET / route hit');

  if (req.session.user) {
    return res.redirect('/dashboard');
  }

  return res.render('auth/login', { title: 'Login' });
});

app.get('/health', (req, res) => {
  res.status(200).send('NexGoRide server is running');
});

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/rides', rideRoutes);
app.use('/users', userRoutes);
app.use('/drivers', driverRoutes);
app.use('/profile', profileRoutes);

app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).render('partials/error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    statusCode: 404
  });
});

app.use((err, req, res, next) => {
  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).render('partials/error', {
    title: 'Server Error',
    message: err.message || 'Something went wrong.',
    statusCode: 500
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`NexGoRide server running on port ${PORT}`);
      console.log(`Open ${HOST}:${PORT} in your browser`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing process or change PORT in .env.`);
        process.exit(1);
      }

      console.error(error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
