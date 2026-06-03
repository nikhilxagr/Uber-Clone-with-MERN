<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:10b981&height=220&section=header&text=Uber%20Clone%20with%20MERN&fontSize=44&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Backend%20API%20for%20ride-booking%20and%20authentication&descAlignY=55&descSize=18" alt="" />
</div>

<div align="center">


A clean backend API for an Uber-style ride platform. This repository currently focuses on authentication, request validation, and MongoDB persistence.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-111827?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Status](https://img.shields.io/badge/Status-Backend%20In%20Progress-0EA5E9?style=for-the-badge)

</div>

---

## Project Snapshot

<table>
<tr>
<td width="50%">

**Purpose**

Build the foundation for a ride-hailing backend with auth-ready APIs and a MongoDB data layer.

</td>
<td width="50%">

**Current Scope**

User registration, login, token generation, request validation, and a simple root response.

</td>
</tr>
</table>

## Core Stack

| Layer      | Technology             | Role                               |
| ---------- | ---------------------- | ---------------------------------- |
| Runtime    | Node.js                | Executes the server                |
| Framework  | Express.js             | Handles routes and middleware      |
| Database   | MongoDB + Mongoose     | Stores user data                   |
| Auth       | bcrypt + JWT           | Hashes passwords and signs tokens  |
| Validation | express-validator      | Checks request payloads            |
| Transport  | CORS + JSON middleware | Supports API requests from clients |

## API Routes

| Method | Route               | Description                          | Payload                                 |
| ------ | ------------------- | ------------------------------------ | --------------------------------------- |
| GET    | /                   | Basic app response                   | None                                    |
| POST   | /api/users/register | Create a new rider or driver account | `fullName`, `email`, `password`, `role` |
| POST   | /api/users/login    | Authenticate an existing user        | `email`, `password`                     |

## Setup

1. Open a terminal in `Backend/`.
2. Install dependencies with `npm install`.
3. Create a `.env` file in `Backend/`.
4. Add your MongoDB connection string and JWT secret.
5. Start the server with `node server.js`.

### Example `.env`

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Folder Map

```text
Backend/
├── app.js
├── server.js
├── db/
├── models/
├── routes/
├── controllers/
└── services/
```

## Notes

- The current repository is backend-only. Add the client setup here when the frontend is introduced.
- The server entrypoint is `Backend/server.js`.
- MongoDB connection is initialized in `Backend/db/db.js`.

## Roadmap

| Next Step                   | Why It Matters                               |
| --------------------------- | -------------------------------------------- |
| Driver and rider ride flows | Completes the Uber-style product flow        |
| Real-time location updates  | Enables live trip tracking                   |
| Ride request lifecycle      | Supports booking, acceptance, and completion |
| Frontend client             | Provides the user-facing experience          |

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,100:0f172a&height=140&section=footer" alt="Footer wave" />
  <p><strong>Built for a fast, clean ride-booking backend.</strong></p>
</div>
