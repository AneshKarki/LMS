# Express Backend

A simple backend built with **Express.js** and **MongoDB**.

## 📦 Requirements

- Node.js (v16 or higher recommended)
- npm or yarn
- MongoDB database (local or cloud, e.g., MongoDB Atlas)

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the project and add the following:

```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=expiry-time (e.g. 1d, 7d)
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=your-admin-password
CORS_ORIGIN=http://localhost:3000


Clone the repository

git clone https://github.com/AneshKarki/LMS.git
cd your-repo-name
Install dependencies
npm install

or

yarn install

Set up .env file
Create .env in the root folder and fill in the variables listed above.

Run database seeders
You can run seed scripts to populate initial data:

# Seed admin user
npm run seed:admin

# Seed course data
npm run seed:courses
Start the development server

npm run dev
or

yarn dev
Access the API

Base URL: http://localhost:5000

🛠️ Tech Stack
Express.js – Web framework

MongoDB + Mongoose – Database & ODM

JWT – Authentication

dotenv – Environment variable management

cors – Cross-Origin Resource Sharing

```
