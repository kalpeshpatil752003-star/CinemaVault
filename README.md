# 🎬 CinemaVault  
### A Frontend Movie Review & Discovery Web Application

---

## 📌 Project Overview

**CinemaVault** is a frontend-based movie review and discovery web application developed using **HTML, CSS, and JavaScript**.  
The application allows users to browse movies, filter and sort them, explore movies by directors, and view detailed information such as ratings, reviews, cast, and trailers.

The project is implemented **without any backend or external libraries**, focusing purely on **core web development concepts**.

---

## 🧠 Technologies Used

- HTML5 – Page structure and semantics  
- CSS3 – Styling, layout, responsiveness (Flexbox & Grid)  
- JavaScript (ES6 Modules) – Dynamic rendering and logic  
- No frameworks or backend (Pure Frontend Project)

---

## ✨ Key Features

### 1. Movie Listing (Home Page)
- Displays all movies in a responsive grid layout  
- Shows poster, title, year, rating, review count, and genres  
- Search movies by title  
- Filter movies by genre  
- Sort movies by:
  - Highest Rating  
  - Latest Release  
  - Alphabetical Order  
- Dynamic movie count display  

---

### 2. Movie Detail Page
- Displays complete movie information:
  - Poster  
  - Title, year, runtime, and director  
  - Genres  
  - Star-based rating system  
  - Synopsis  
  - Cast list  
  - Embedded trailer  
- Displays user reviews with:
  - Reviewer name  
  - Rating  
  - Review date  
  - Review comment  
- Handles invalid or missing movie IDs gracefully  

---

### 3. Directors Page
- Groups movies by director  
- Displays director statistics:
  - Total movies  
  - Average rating  
  - Total reviews  
- Lists movies under each director sorted by rating  
- Search directors by name  
- Clickable movies redirect to the movie detail page  

---

## 🗂 Project Structure1

CinemaVault/
│
├── index.html # Home page (movie listing)
├── detail.html # Movie detail page
├── directors.html # Directors page
│
├── main.js # Movie filtering, sorting, searching
├── detail.js # Movie details & reviews rendering
├── directors.js # Director grouping and statistics
├── data.js # Central movie data source
│
├── styles.css # Global styling and UI design
└── README.md


---

## 🎨 UI & Design Highlights

- Dark-themed modern UI  
- CSS variables for consistent color scheme  
- Responsive layout using Flexbox and Grid  
- Smooth hover effects and transitions  
- Sticky navigation header  
- Mobile-friendly structure  

---

![Home Page](home-page.png)

### Movie Detail Page
![Movie Detail Page](movie-detail-page.png)

### Directors Page
![Directors Page](directors-page.png)

---

## 🚀 How to Run the Project

1. Download or clone the repository  
2. Open `index.html` in any modern browser  
3. No installation or backend setup required  

> If ES modules do not load directly, use:
```bash
npx serve


📘 Project Report
1️⃣ Aim of the Project

The aim of the CinemaVault project is to design and develop a user-friendly movie review and discovery website using core web technologies, enabling users to explore movies, view ratings and reviews, and navigate content efficiently without using any backend services.

2️⃣ Objectives of the Project

To understand and implement HTML, CSS, and JavaScript in a real-world application

To design a responsive and interactive user interface

To implement dynamic data rendering using JavaScript

To provide features like searching, filtering, and sorting

To demonstrate modular JavaScript programming using ES6 modules

To build a project suitable for academic evaluation and portfolio use

3️⃣ Scope of the Project

Frontend-only movie review system

Static data source using JavaScript

No user authentication or backend integration

Can be extended in the future with APIs and databases

4️⃣ Conclusion

The CinemaVault project successfully demonstrates the use of core web development concepts to build a fully functional frontend application.
It provides an intuitive interface for browsing movies, viewing detailed information, and exploring directors.
This project strengthens understanding of DOM manipulation, modular JavaScript, responsive design, and UI/UX principles, making it a strong academic and portfolio-level project.
