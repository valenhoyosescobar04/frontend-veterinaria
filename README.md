
---

# VetClinic Pro – Frontend Application

Frontend web application for the Veterinary Clinic Management System.
Built with modern web technologies, providing a responsive and user-friendly interface connected to the VetClinic Pro Backend API.

---

## Technology Stack

* **React**
* **Vite**
* **Axios**
* **React Router**
* **TailwindCSS / Bootstrap**

---

## Architecture

The frontend follows modern client-side architecture principles:

1. **Client–Server Architecture**
   Communicates with the backend REST API using HTTP requests (Axios).

2. **Component-Based Architecture**
   UI structured into reusable and modular components.

3. **Single Page Application (SPA)**
   Dynamic rendering without full page reloads.

4. **State Management Architecture**
   Local and/or global state handled using React Hooks or Context API.

---

## Security

* JWT authentication integration
* Protected routes based on user roles
* Secure token storage (localStorage/sessionStorage)

---

## Requirements

* Node.js 18+
* npm or yarn

---

## Installation

Clone the repository:

```bash
[git clone https://github.com/your-repo/frontend-vetclinic.git](https://github.com/valenhoyosescobar04/frontend-veterinaria.git)
cd frontend-veterinaria
```

Install dependencies:

```bash
npm install
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Application available at:

```
http://localhost:5173
```

---

### Production Build

```bash
npm run build
npm run preview
```

---

## Backend Integration

The frontend connects to the backend API at:

```
http://localhost:8080/api
```

Make sure the backend server is running before starting the frontend.

---

## Project Structure

```
src/
 ├── components/    
 ├── pages/          
 ├── services/      
 ├── routes/         
 ├── context/        
 └── App.jsx
```

---

## Branching Strategy

* `main` → Stable production branch
* `develop` → Development integration branch
* `feature/*` → Feature branches

---

**Version:** 1.0.0

**Type:** Enterprise Web Application

**Integrated With:** VetClinic Pro Backend API

---

