# Resume Analyzer & Job Matcher System

A comprehensive Node.js application that analyzes resumes, extracts skills, and matches them with available job positions using intelligent algorithms.

## Features

### 🔒 User Authentication
- **Sign up / Login**: Users must create an account and login before using any functionality
- Tokens stored in browser storage with JWT-based backend verification


### 📄 Resume Analysis
- **PDF Parsing**: Extracts text from PDF resumes automatically
- **Skill Detection**: Identifies technical and soft skills from resume content
- **Skill Categorization**: Organizes skills into categories (languages, frontend, backend, databases, cloud, DevOps, tools, soft skills)
- **Advanced Matching**: Uses intelligent algorithm to match resume against job postings

### 💼 Job Management
- **Create Job Postings**: HR can post new job openings with required skills
- **View Job Listings**: Browse all available positions
- **Skill Requirements**: Define exact skills needed for each position
- **Experience Levels**: Categorize jobs by experience level (junior, mid, senior)

### 📊 Analytics & Statistics
- **Match Statistics**: See overall matching percentages and analysis
- **Job Analytics**: Track total jobs, jobs by level, salary ranges
- **Resume Analytics**: View recent resume analyses with skill summaries
- **Skill Trends**: Identify most demanded skills across all analyses

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- **PostgreSQL 12+** (Now required for data storage)

### Database Setup - IMPORTANT

This application now uses **PostgreSQL** instead of JSON files. 

**Quick Setup:**
1. Install PostgreSQL (https://www.postgresql.org/download/)
2. Create database: `createdb ats_portal`
3. Run schema: `psql -U postgres -d ats_portal -f backend/db/schema.sql`
4. Update `.env` with your PostgreSQL credentials (see below)

📖 **Full instructions**: See `POSTGRESQL_MIGRATION_GUIDE.md`

### Setup

1. **Navigate to the project**
```bash
cd nodejs_finaledit
```

2. **Install dependencies**
```bash
npm install
```

3. **Configuration**
Create a `.env` file in the project root:
```
# Server Configuration
PORT=3000

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ats_portal

# API Keys
SERPAPI_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_key_here

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here
```

4. **Start the server**
```bash
npm start
# or
node backend/src/server.js
```

5. **Access the application**
Open your browser and navigate to: `http://localhost:3000`

## Usage

### For Job Seekers

#### Analyze Your Resume
1. Go to **Resume Analyzer** tab
2. Click the upload box or drag-and-drop your PDF resume
3. Click **Analyze & Find Matches**
4. View:
   - Skills found in your resume
   - Matched job positions
   - Match percentage for each job
   - Missing skills needed for each position
   - Skill categories breakdown

### For Recruiters/HR

#### Post a New Job
1. Go to **Add Job** tab
2. Fill in job details:
   - Job Title (required)
   - Company Name (required)
   - Location
   - Experience Level (junior/mid/senior)
   - Description
   - Required Skills (comma-separated) (required)
   - Salary Range
3. Click **Post Job**
4. Job appears immediately in the job listings

#### View Job Listings
1. Go to **Jobs** tab
2. View all posted positions
3. Delete jobs using the delete button if needed

#### View Statistics
1. Go to **Statistics** tab
2. See:
   - Total jobs posted
   - Total resumes analyzed
   - Jobs by experience level
   - Recent analysis history
   - Top skills identified

## API Endpoints

### Resume Analysis
```
POST /api/match-jobs
- Upload a PDF resume
- Returns: skills found, matched jobs, analysis summary
- Content-Type: multipart/form-data
```

### Job Management
```
GET /api/jobs
- Get all job postings
- Returns: Array of job objects

GET /api/jobs/:id
- Get a specific job by ID
- Returns: Job object

POST /api/jobs
- Create a new job posting
- Body: { title, company, location, description, requirements, experience_level, salary }
- Returns: Created job object

DELETE /api/jobs/:id
- Delete a job posting
- Returns: { success: true }
```

### Statistics
```
GET /api/statistics
- Get system statistics
- Returns: total_jobs, total_resumes_analyzed, jobs_by_level, top_skills, recent_analysis
```

## Data Structure

### Job Object
```json
{
  "id": "uuid",
  "title": "String",
  "company": "String",
  "location": "String",
  "description": "String",
  "requirements": ["Skill1", "Skill2"],
  "experience_level": "junior|mid|senior",
  "salary": "String",
  "posted_date": "ISO Date"
}
```

### Resume Analysis Result
```json
{
  "user_skills": ["Skill1", "Skill2"],
  "categorized_skills": {
    "languages": ["JavaScript"],
    "frontend": ["React"],
    ...
  },
  "matches": [
    {
      "id": "uuid",
      "title": "String",
      "company": "String",
      "match_percentage": 75,
      "match_data": {
        "matched": ["Skill1"],
        "missing": ["Skill2"],
        "percentage": 75,
        "skill_count": 3,
        "total_required": 4
      }
    }
  ],
  "analysis": {
    "total_skills_found": 5,
    "total_jobs_matched": 3,
    "best_match": 85,
    "average_match": 72
  }
}
```

## Skill Categories

The system recognizes skills across multiple categories:

- **Languages**: JavaScript, Python, Java, C++, PHP, TypeScript, C#, Go, Rust, Swift
- **Frontend**: React, Angular, Vue, HTML, CSS, Bootstrap, Tailwind CSS, Next.js, Svelte
- **Backend**: Node.js, Express, Django, Flask, Spring Boot, Laravel, Ruby on Rails, ASP.NET
- **Databases**: SQL, MongoDB, PostgreSQL, MySQL, Redis, Elasticsearch, Cassandra, DynamoDB
- **Cloud**: AWS, Azure, Google Cloud, Heroku, DigitalOcean
- **DevOps**: Docker, Kubernetes, Jenkins, CI/CD, Git, GitHub Actions, GitLab CI
- **Tools**: Git, VS Code, Jira, Slack, Figma, Postman, Linux, Windows, macOS
- **Soft Skills**: Communication, Leadership, Problem Solving, Team Work, Project Management, Agile, Scrum

## How Matching Works

The matching algorithm:

1. **Extracts Skills** from the resume using regex pattern matching
2. **Categorizes Skills** into functional areas
3. **Compares** user skills against job requirements
4. **Calculates Match Score** as: (matched_skills / total_required_skills) × 100
5. **Sorts Jobs** by match percentage (highest first)
6. **Provides Insights** on matched and missing skills

### Match Score Interpretation
- **75-100%**: Excellent fit - Apply now!
- **50-74%**: Good fit - You're a viable candidate
- **25-49%**: Moderate fit - Consider upskilling
- **0-24%**: Poor fit - May need significant training

## File Structure

```
nodejs/
├── server.js              # Express server with API endpoints
├── package.json           # Dependencies
├── skills.json            # Skill categories and definitions
├── jobs.json              # Job postings database (auto-created)
├── resumes.json           # Resume analysis history (auto-created)
├── README.md              # This file
└── public/
    ├── index.html         # Frontend UI
    └── (CSS/JS embedded)
```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF Processing**: pdf.js-extract
- **File Handling**: Multer
- **Database**: JSON files (local storage)
- **API Integration**: SerpAPI (optional, for real job listings)

## Example Resume Content

The system looks for skill mentions in resumes like:
```
- Proficient in JavaScript, React, and Node.js
- Experience with MongoDB and PostgreSQL
- AWS and Docker containerization
- Leadership and team collaboration
```

## Future Enhancements

- [ ] MongoDB/PostgreSQL integration
- [ ] User authentication and profiles
- [ ] Email notifications for new matches
- [ ] Resume parsing improvements (DOC, DOCX support)
- [ ] Job recommendations based on skills
- [ ] Salary prediction
- [ ] Company reviews integration
- [ ] Interview preparation resources

## Troubleshooting

### PDF Not Parsing
- Ensure the PDF is text-based (not scanned image)
- Try re-saving the PDF from the source application

### No Skills Detected
- Ensure skills are explicitly mentioned in the resume
- Check that skill names match the database
- Add more skills to `skills.json` if needed

### Port Already in Use
```bash
# Change port in .env file or:
PORT=3001 npm start
```

## Contributing

Feel free to fork, modify, and improve this project!

## License 

Open source - Use freely for personal and commercial projects.

## Support 

For issues or questions, check the code comments or create an issue in your repository.

---

**Built with ❤️ for job seekers and recruiters**
