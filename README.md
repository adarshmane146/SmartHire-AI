# SmartHire – AI Resume Analyzer and Live Internship & Fresher Job Discovery Platform

SmartHire is a web-based platform designed to help students and fresh graduates improve their resumes and discover relevant internship and job opportunities. The system analyzes uploaded resumes, extracts technical skills, generates an ATS score, and recommends suitable job roles based on the candidate’s profile.

The platform bridges the gap between job seekers and employers by combining resume analysis, skill detection, and live job discovery into a single intelligent system.

## Project Overview

The SmartHire platform allows users to upload their resume in PDF format. The system automatically extracts information such as skills, education, projects, certifications, and experience using resume parsing techniques. Based on the extracted data, the platform generates an ATS compatibility score and recommends suitable internship and fresher job opportunities.

The system also fetches live job listings and matches them with the candidate’s skill set, helping users discover relevant opportunities more efficiently.

## Key Features

### Resume Upload and Parsing
Users can upload resumes in PDF format and the system automatically extracts important information from the document.

### Skill Extraction
The platform identifies technical skills and relevant keywords from resume content.

### ATS Score Evaluation
The system generates an Applicant Tracking System score to evaluate resume quality and compatibility with industry standards.

### Job and Internship Recommendations
Based on the extracted skills, the system recommends suitable internship and fresher job opportunities.

### Live Job Discovery
The platform fetches live job listings from external sources and displays relevant opportunities for candidates.

### Applicant Tracking
Recruiters can evaluate candidate resumes and rank applicants based on ATS scores.

### Statistics and Insights
The system provides insights such as skill demand trends, job statistics, and skill distribution analytics.

## System Workflow

The SmartHire system follows these steps:

1. User registers or logs into the platform
2. User uploads a resume in PDF format
3. The system extracts text and identifies skills from the resume
4. Resume analysis is performed and an ATS score is generated
5. Extracted skills are compared with available job listings
6. Matching job opportunities are identified
7. Recommended internships and jobs are displayed to the user

This process helps automate resume evaluation and job discovery.

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

### Libraries and Tools
- Multer for file uploads
- PDF parsing libraries for resume extraction
- Chart.js for analytics visualization

### Development Tools
- Visual Studio Code
- Git and GitHub

## Project Structure

```
SmartHire-AI

backend
├── src
│   ├── routes
│   ├── middleware
│   ├── utils
├── db
│   └── schema.sql

frontend
├── public
├── css
├── js

README.md
```

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
- Recruiters can analyze candidate resumes quickly using ATS scoring.
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
