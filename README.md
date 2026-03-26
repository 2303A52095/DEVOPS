# NexGoRide

NexGoRide is a production-ready ride booking web application built with Node.js, Express.js, MongoDB, and EJS using MVC architecture.

## Features

- Session-based authentication with `express-session` and `connect-mongo`
- Role-based access for `admin`, `user`, and `driver`
- Ride booking with fare estimation, status flow, and driver assignment
- Admin-only user and driver management
- Dashboard analytics with Chart.js
- Profile management with image uploads using Multer
- Leaflet map integration for pickup and drop visualization

## Project Structure

```text
project/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── views/
│   ├── auth/
│   ├── dashboard/
│   ├── rides/
│   ├── users/
│   ├── drivers/
│   ├── profile/
│   └── partials/
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
├── .env.example
├── .gitignore
├── app.js
└── package.json
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add your current IP address in Atlas Network Access.
4. Open Atlas and choose `Connect > Drivers`.
5. Copy the connection string and replace the values in `.env`.

Example:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/goride?retryWrites=true&w=majority&appName=NexGoRide
```

## Local Run Steps

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Update `.env` with your MongoDB Atlas connection string and a secure `SESSION_SECRET`.

4. Start the application:

```bash
npm start
```

5. Open:

```text
http://localhost:5000
```

## GitHub Upload Instructions

1. Create a new GitHub repository.
2. Initialize git locally if needed:

```bash
git init
git add .
git commit -m "Initial NexGoRide app"
```

3. Connect your remote repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Notes

- Uploaded profile files are stored in `public/uploads`.
- The app uses deterministic route coordinates for fare estimation and map plotting without needing a paid maps API.
- Admin users can manage all data. Regular users manage only their own rides. Drivers see rides assigned to them.
