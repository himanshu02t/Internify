# 🌐 Internify – AI-powered Internship Matchmaker

Internify is a premium full-stack internship portal that matches student profiles with relevant internships using a customized skills matching algorithm. The platform handles user roles (Students & Admins), calculates match percentages, highlights missing skill gaps, supports resume uploads, and manages applications dynamically.

---

## 🛠️ Technology Stack Used

### 1. Backend Architecture (Node.js & Express)
*   **Node.js**: The Javascript runtime executing the server-side environment.
*   **Express.js**: Fast, minimalist web framework used to design RESTful API routing controls.
*   **MongoDB & Mongoose ODM**: NoSQL document database used to define database structures (User, Internship, and Application models).
*   **JSON Web Tokens (JWT)**: Secure user session validation and role-based route protection.
*   **bcryptjs**: Used to securely hash and verify passwords in signup/login controllers.
*   **Multer**: Node.js middleware for handling `multipart/form-data` uploads (used for uploading PDF resumes).

### 2. Frontend Architecture (React & Vite)
*   **Vite**: Next-generation frontend build tool for instant Hot Module Replacement (HMR) and fast build packaging.
*   **React (ES6+)**: Component-driven UI framework managing active states, contexts, and application dashboards.
*   **React Router DOM**: Client-side routing management for protected user/admin routes.
*   **Axios**: Promise-based HTTP client to call backend APIs. It includes interceptors to attach JWT tokens to the `Authorization` header and clear sessions dynamically on `401 Unauthorized` responses.
*   **Lucide React**: Clean SVG icon system integrated into the dashboards.

---

## 🎯 Key Features & Matching Logic

1.  **Pure JavaScript Matching Engine**:
    *   **Fit Score**: Compares user skills with the internship's required skills to determine a percentage score:
        $$\text{matchPercentage} = \text{Math.round}\left(\frac{\text{matchedSkills.length}}{\text{skillsRequired.length}} \times 100\right)$$
    *   **Skill Gap**: Lists missing skills not present in the student's profile.
    *   **Sorted Recommendations**: Retrieves matching internships, filters out 0% fits, and sorts them from highest to lowest.
2.  **Student Pipeline Tracker**: Live pipeline tracking application status (`Pending`, `Accepted`, `Rejected`) with dynamic status tags.
3.  **Admin Review Workspace**: Clean administrative board displaying applicant names, emails, match percentages, missing skill badges, resume PDFs, and an immediate PUT update selector for application approval states.
4.  **Premium Glassmorphism Design**: Outfit typography, backdrops, neon accent drops, and progress bars.

---

## 🚀 Installation & Setup

### Prerequisites
Make sure you have installed:
1.  **Node.js** (LTS Version): Download from [nodejs.org](https://nodejs.org/).
2.  **MongoDB**: Either locally running **MongoDB Community Server** or a free cloud cluster on **MongoDB Atlas** (paste Atlas connection URI inside `.env`).

### Setup Instructions
1.  **Clone / Download the project folder**.
2.  **Setup Environment Variables**:
    Create a `.env` file in the root directory (template provided):
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/internify
    JWT_SECRET=super_secret_jwt_key
    ```

3.  **Install Root Backend Dependencies**:
    Open a terminal at the project root and run:
    ```bash
    npm install
    ```

4.  **Install Frontend Dependencies**:
    Open a terminal inside the `Frontend` folder and run:
    ```bash
    cd Frontend
    npm install
    ```

---

## 💻 Running the Servers

### 1. Start Backend Server
From the project root directory, run:
```bash
npm run dev
```
*(Server will start running on port `5000`)*

### 2. Start Frontend Server
From the `Frontend` folder directory, run:
```bash
npm run dev
```
*(The dev server will host the Vite React app at `http://localhost:5173/`)*
