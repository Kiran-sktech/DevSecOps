# Forever – Team Setup
1. Clone the Repository


git clone YOUR_REPOSITORY_URL
cd forever

2. Install Dependencies

There are 3 separate folders, so install dependencies in each one.

Frontend
cd frontend
npm install
Backend
cd ../backend
npm install
Admin
cd ../admin
npm install
3. Create Environment Files

Each teammate must create their own .env files locally.

Backend

Create:

backend/.env

Add:

PORT=4000

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Frontend

Create:

frontend/.env

Add:

VITE_BACKEND_URL=http://localhost:4000
Admin

Create:

admin/.env

Add:

VITE_BACKEND_URL=http://localhost:4000

Do not upload .env files to GitHub.

4. Run the Project

Open 3 terminals.

Terminal 1 – Backend
cd backend
npm run dev

Runs on:

http://localhost:4000
Terminal 2 – Frontend
cd frontend
npm run dev

Runs on:

http://localhost:5173
Terminal 3 – Admin
cd admin
npm run dev

Runs on:

http://localhost:5174
Important
Everyone should create their own .env files.
The team can use the same MongoDB Atlas database.
Do not commit .env files.
Install node_modules separately inside frontend, backend, and admin.
Do not push directly to main; use a feature branch and Pull Request.