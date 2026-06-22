# SmartHire – AI Resume Analyzer and Live Internship & Fresher Job Discovery Platform

SmartHire is a web-based platform designed to help students and fresh graduates improve their resumes and discover relevant internship and job opportunities. The system analyzes uploaded resumes, extracts technical skills, generates an ATS score, and recommends suitable job roles based on the candidate’s profile.

The platform bridges the gap between job seekers and employers by combining resume analysis, skill detection, and live job discovery into a single intelligent system.

## Project Overview

The SmartHire platform allows users to upload their resume in PDF format. The system automatically extracts information such as skills, education, projects, certifications, and experience using resume parsing techniques.

The platform then uses **Gemini 2.5 Flash AI model** to evaluate the resume and generate an ATS compatibility score along with improvement suggestions.

The system also fetches live internship and fresher job listings using **SerpAPI (Google Jobs API)** and matches them with the candidate’s extracted skills, helping users discover relevant opportunities more efficiently.

## Key Features

### Resume Upload and Parsing
Users can upload resumes in PDF format and the system automatically extracts important information from the document.
<img width="1918" height="905" alt="image" src="https://github.com/user-attachments/assets/e0e987ef-b0fe-4784-b858-d9df29a72e0f" />

### Skill Extraction
The platform identifies technical skills and relevant keywords from resume content.
<img width="1905" height="480" alt="image" src="https://github.com/user-attachments/assets/a872a329-dc53-45c4-82ef-9f73bf3e0c6e" />

### AI-Powered ATS Score Evaluation
<img width="1912" height="692" alt="image" src="https://github.com/user-attachments/assets/34bb18f8-9eba-480a-9f8c-f0d7884d6c2a" />
<img width="1917" height="747" alt="image" src="https://github.com/user-attachments/assets/3422724f-6ec7-4f1e-88bd-39458f7fa8d9" />


The system generates an Applicant Tracking System score using **Gemini 2.5 Flash AI**, analyzing resume structure, keyword relevance, and skill alignment with industry standards.

### Job and Internship Recommendations
Based on the extracted skills, the system recommends suitable internship and fresher job opportunities.
<img width="1918" height="785" alt="image" src="https://github.com/user-attachments/assets/160dcc59-d747-4574-96b8-0bb3dd912ea7" />

### Live Job Discovery
The platform fetches real-time job listings using **SerpAPI (Google Jobs API)** and displays relevant opportunities for candidates.
<img width="1917" height="791" alt="image" src="https://github.com/user-attachments/assets/fdac014d-8626-40ec-a7a7-e50bd47dd06b" />

### Statistics and Insights
The system provides insights such as skill demand trends, job statistics, and skill distribution analytics.
<img width="1917" height="871" alt="image" src="https://github.com/user-attachments/assets/64054ea0-d13a-4fd1-ba44-36faac534bae" />

## Technology Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### APIs & AI Services
- **SerpAPI** – Fetches live fresher and internship job listings from Google Jobs
- **Google Gemini 2.5 Flash** – Used for AI-based ATS resume analysis and scoring

### Libraries and Tools
- Multer for file uploads
- PDF parsing libraries for resume extraction
- Chart.js for analytics visualization

### Development Tools
- Visual Studio Code
- Git and GitHub

## System Workflow

The SmartHire system follows these steps:

1. User registers or logs into the platform
2. User uploads a resume in PDF format
3. The system extracts text and identifies skills from the resume
4. **Gemini AI** analyzes the resume and generates an ATS score
5. Extracted skills are compared with available job listings
6. Live job listings are fetched using **SerpAPI**
7. Matching job opportunities are identified
8. Recommended internships and jobs are displayed to the user

This process helps automate resume evaluation and job discovery.

## Installation

### Prerequisites

- Node.js version 14 or higher
- npm or yarn
- PostgreSQL database

### Steps to run the project

1. Clone the repository:
   ```bash
   git clone https://github.com/adarshmane146/SmartHire-AI.git
   ```
2. Navigate to the project folder:
   ```bash
   cd SmartHire-AI
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
5. Start backend server:
   ```bash
   cd backend
   npm start
   ```
6. Start frontend server:
   ```bash
   cd ../frontend
   npm start
   ```

## Use Cases

- Students and fresh graduates can upload resumes and receive job recommendations.
- Users can discover real-time internship and fresher job opportunities.
- The system provides insights about skill demand in the job market.

## Future Enhancements

- Machine learning based resume analysis
- Advanced NLP skill extraction
- AI-powered resume improvement suggestions
- Integration with more job APIs
- Personalized career guidance recommendations

## About the Project

This project, **SmartHire – AI Resume Analyzer and Live Internship & Fresher Job Discovery Platform**, was developed as part of the final year B.Tech CSE project by a team of students from **Ideal Institute of Technology, Kakinada, Andhra Pradesh**.

## License

This project is developed for educational and research purposes.
