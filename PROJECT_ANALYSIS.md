# ATS Job Portal - Project Analysis

## 1. WHERE SAMPLE/MOCK JOB POSITIONS ARE STORED

### Primary Storage: PostgreSQL Database
Jobs are stored in the `jobs` table with the `job_requirements` table for many-to-many relationship.

**Database Schema:**
```sql
-- jobs table (main storage)
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT 'India',
    description TEXT,
    experience_level VARCHAR(50) DEFAULT 'fresher',
    salary VARCHAR(255),
    apply_link TEXT,
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, company)
);

-- job_requirements table (many-to-many)
CREATE TABLE IF NOT EXISTS job_requirements (
    id SERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    requirement VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Skills Data File
Static skills taxonomy used for extraction and categorization:
- **File**: `backend/data/skills.json`
- **Format**: JSON with technical_skills array and categorized skills by type

```json
{
  "technical_skills": [
    "JavaScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift",
    "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt.js",
    "Node.js", "Express", "Django", "Flask", "Spring", "Laravel",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD",
    "Git", "REST API", "GraphQL", "Microservices", "TypeScript",
    "HTML", "CSS", "Sass", "Tailwind", "Bootstrap",
    "Testing", "Jest", "Mocha", "Chai", "Pytest",
    "Linux", "Windows", "Mac", "Shell", "Bash"
  ],
  "categories": {
    "languages": ["JavaScript", "Python", "Java", ...],
    "frontend": ["React", "Vue", "Angular", ...],
    "backend": ["Node.js", "Express", "Django", ...],
    "databases": ["MongoDB", "PostgreSQL", "MySQL", ...],
    "cloud": ["AWS", "Azure", "GCP", ...],
    "devops": ["Docker", "Kubernetes", "CI/CD", ...],
    "tools": ["Git", "VS Code", "Postman", ...],
    "soft_skills": ["Communication", "Problem Solving", ...],
    "concepts": ["REST API", "GraphQL", "Microservices", ...]
  }
}
```

### Fallback Behavior
If live jobs API fails or is not configured:
```javascript
// backend/src/routes/liveJobs.js
if (!process.env.SERPAPI_KEY) {
    console.warn('⚠️ SERPAPI_KEY not set; returning local sample jobs only');
    const { getAllJobs } = await import('../utils/database.js');
    const jobs = await getAllJobs();
    const filtered = jobs.filter(j => j.title.toLowerCase().includes(query.toLowerCase()));
    return res.json({
        jobs: filtered.map((job, idx) => ({
            ...job,
            id: `local_${idx}_${Date.now()}`
        })),
        count: filtered.length,
        source: 'local_fallback'
    });
}
```

---

## 2. HOW MANY JOBS ARE CURRENTLY STORED

### Current Status: Dynamic
The number of jobs is **variable and stored dynamically** in PostgreSQL:

### Retrieving Job Count

**Database Query Function** (`backend/src/utils/database.js`):
```javascript
async function getAllJobs() {
    try {
        const result = await pool.query(
            `SELECT 
                j.id, j.title, j.company, j.location, j.description, 
                j.experience_level, j.salary, j.apply_link, j.posted_date,
                COALESCE(json_agg(json_build_object('id', jr.id, 'requirement', jr.requirement)) 
                    FILTER (WHERE jr.id IS NOT NULL), '[]'::json) as requirements
            FROM jobs j
            LEFT JOIN job_requirements jr ON j.id = jr.job_id
            GROUP BY j.id
            ORDER BY j.posted_date DESC`
        );
        return result.rows;  // Returns ALL jobs from database
    } catch (err) {
        console.error('Error fetching jobs:', err);
        return [];
    }
}
```

### Get Job Count via API
```bash
GET /api/jobs
```

Returns array of all jobs. Length of array = current count.

### Statistics Endpoint
```javascript
// backend/src/routes/statistics.js
const jobs = await getAllJobs() || [];
const jobOpenings = jobs.length;  // Total count

return res.json({
    total_jobs: jobOpenings,
    jobs_by_level: {
        fresher: fresherCount,
        mid: midCount,
        senior: seniorCount
    },
    ...
});
```

### Sample Response Structure
```json
{
  "total_jobs": 25,
  "jobs_by_level": {
    "fresher": 15,
    "mid": 7,
    "senior": 3
  },
  "total_resumes_analyzed": 42,
  "top_skills": [
    {"skill": "JavaScript", "count": 38},
    {"skill": "React", "count": 32},
    {"skill": "PostgreSQL", "count": 18}
  ]
}
```

---

## 3. RESUME UPLOAD ENDPOINT AND FLOW

### Upload Endpoint
```
POST /api/resume/analyze
Content-Type: multipart/form-data
Header: Authorization: Bearer <jwt_token>
```

### Complete Upload Flow

**Step 1: Middleware Setup** (`backend/src/middleware/uploadMiddleware.js`)
```javascript
import multer from "multer";
const storage = multer.memoryStorage();  // Store in memory
const upload = multer({ storage });
export default upload;
```

**Step 2: Route Handler** (`backend/src/routes/resume.js`)
```javascript
router.post('/analyze', async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // 1. EXTRACT USER ID FROM JWT TOKEN
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                console.warn("JWT decode failed");
            }
        }

        console.log("📄 Processing Resume...");

        // 2. EXTRACT PDF TEXT
        pdfExtract.extractBuffer(req.file.buffer, {}, async (err, data) => {
            if (err) {
                return res.status(500).json({ error: "PDF Read Error" });
            }

            const fullText = data.pages
                .map(p => p.content.map(i => i.str).join(' '))
                .join(' ');

            // 3. EXTRACT SKILLS FROM TEXT
            const userSkills = extractSkills(fullText);
            const categorizedSkills = categorizeSkills(userSkills);

            console.log("✅ Skills Detected:", userSkills.length);

            // 4. GET LOCAL JOBS
            const localJobs = await getAllJobs();

            // 5. SEARCH LIVE JOBS (if SerpAPI key configured)
            let liveJobs = [];
            // ... SerpAPI calls with multiple search variations
        });
    } catch (err) {
        // Error handling
    }
});
```

**Step 3: Server Route Registration** (`backend/src/server.js`)
```javascript
import upload from "./middleware/uploadMiddleware.js";
import resumeRoutes from "./routes/resume.js";

// Register middleware for upload
app.use("/api/resume", upload.single("resume"), resumeRoutes);
```

### Frontend Implementation (`frontend/public/js/resumeAnalyzer.js`)
```javascript
async function processResume() {
    if (!fileInput.files[0]) return alert("Please select a PDF file.");
    
    const formData = new FormData();
    formData.append('resume', fileInput.files[0]);  // File with key "resume"
    
    resultsDiv.innerHTML = '';
    showLoading(true);
    if (analyzeBtn) analyzeBtn.disabled = true;
    
    try {
        const response = await fetch(API_BASE_URL + '/api/resume/analyze', {
            method: 'POST',
            headers: {
                ...getAuthHeaders()  // Includes JWT token
            },
            body: formData
        });
        
        const data = await response.json();
        showLoading(false);
        // Display results
    } catch (error) {
        console.error('Error:', error);
    }
}
```

**Step 4: Resume Data Saved to Database**
```javascript
const resumeData = await saveResume({
    user_id: userId,
    filename: req.file.originalname,
    skills: userSkills,
    categorized_skills: categorizedSkills,
    total_skills: userSkills.length,
    local_matches_found: localMatches.length,
    live_matches_found: liveMatches.length,
    raw_text: fullText.substring(0, 5000),
    summary: fullText.substring(0, 500),
    experience: fullText.match(/experience|worked|position|role/i) 
        ? "has_experience" 
        : "no_experience"
});
```

### Database Storage
```javascript
// backend/src/utils/database.js
async function saveResume(analysisData) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { user_id, filename, skills, categorized_skills } = analysisData;
        
        // Insert resume
        const resumeResult = await client.query(
            'INSERT INTO resumes (user_id, filename) VALUES ($1, $2) RETURNING *',
            [user_id || null, filename || 'resume.pdf']
        );
        
        const resumeId = resumeResult.rows[0].id;
        
        // Insert skills for this resume
        if (Array.isArray(skills) && skills.length > 0) {
            for (const skill of skills) {
                const category = extractCategoryForSkill(skill, categorized_skills);
                await client.query(
                    'INSERT INTO resume_skills (resume_id, skill_name, category) VALUES ($1, $2, $3)',
                    [resumeId, skill, category || null]
                );
            }
        }
        
        await client.query('COMMIT');
        return resumeResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
```

---

## 4. JOB FETCHING AND MATCHING AFTER RESUME UPLOAD

### Step 1: Fetch Local Jobs
```javascript
// From resume.js - after skills extracted
const localJobs = await getAllJobs();
```

### Step 2: Calculate Match Scores
**Matching Algorithm** (`backend/src/utils/jobMatcher.js`):
```javascript
function calculateMatch(userSkills = [], jobRequirements = []) {
    // Ensure arrays
    if (!Array.isArray(userSkills)) userSkills = [];
    if (!Array.isArray(jobRequirements)) jobRequirements = [];

    // Handle fresh job requirements
    if (jobRequirements.length === 0) {
        return {
            matched: [],
            missing: [],
            percentage: 30,
            total_required: 1
        };
    }

    // Convert user skills to lowercase
    const userSkillsLower = userSkills
        .filter(skill => typeof skill === "string")
        .map(skill => skill.toLowerCase());

    const matched = [];
    const missing = [];

    // Compare each requirement
    for (let req of jobRequirements) {
        if (typeof req !== "string") continue;
        const requirement = req.toLowerCase();

        if (userSkillsLower.includes(requirement)) {
            matched.push(req);
        } else {
            missing.push(req);
        }
    }

    // Calculate percentage
    let percentage = Math.round((matched.length / jobRequirements.length) * 100);

    // Minimum 15% for fresher-friendly jobs
    if (percentage === 0 && jobRequirements.length > 0) {
        percentage = 15;
    }

    return {
        matched,
        missing,
        percentage,
        total_required: jobRequirements.length
    };
}
```

### Step 3: Map Local Jobs with Scores
```javascript
const localMatches = localJobs.map(job => {
    const match = calculateMatch(userSkills, job.requirements);
    return {
        ...job,
        match_data: match,
        match_percentage: match.percentage,
        source: "local"
    };
}).sort((a, b) => b.match_percentage - a.match_percentage);
```

### Step 4: Save Job Matches to Database
```javascript
// Save all matches (local + live) to database
async function saveJobMatches(resumeId, matches) {
    try {
        for (const match of matches) {
            let jobId = match.job_id;
            
            // Skip if live job wasn't inserted
            if (typeof jobId === 'string' && jobId.startsWith('live_')) {
                console.warn('Unexpected live job ID, skipping:', jobId);
                continue;
            }
            
            await pool.query(
                `INSERT INTO job_matches (resume_id, job_id, match_percentage, match_data) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT DO NOTHING`,
                [resumeId, jobId, match.match_percentage, JSON.stringify(match)]
            );
        }
        return true;
    } catch (err) {
        console.error('Error saving job matches:', err);
        throw err;
    }
}

// In resume.js - save matches after getting match scores
if (resumeData && resumeData.id) {
    const processedMatches = [];
    for (const job of allMatches) {
        processedMatches.push({
            job_id: job.id,
            match_percentage: job.match_percentage,
            match_data: job.match_data
        });
    }
    
    if (processedMatches.length > 0) {
        await saveJobMatches(resumeData.id, processedMatches);
        console.log(`✅ Saved ${processedMatches.length} job matches`);
    }
}
```

### Step 5: Response to Frontend
```javascript
res.json({
    user_skills: userSkills,
    categorized_skills: categorizedSkills,
    local_matches: localMatches,      // Local DB jobs
    live_matches: liveMatches,        // SerpAPI jobs
    all_matches: allMatches,          // Combined, sorted by score
    analysis: {
        total_skills_found: userSkills.length,
        local_jobs_matched: localMatches.length,
        live_jobs_matched: liveMatches.length,
        total_matched: allMatches.length,
        best_match: Math.max(...allMatches.map(m => m.match_percentage)) || 0,
        averageMatch: Math.round(
            allMatches.reduce((sum, m) => sum + m.match_percentage, 0) / 
            allMatches.length
        ) || 0
    }
});
```

### Database Schema for Matches
```sql
CREATE TABLE IF NOT EXISTS job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_percentage FLOAT,
    match_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_matches_resume_id ON job_matches(resume_id);
CREATE INDEX idx_job_matches_job_id ON job_matches(job_id);
```

---

## 5. LIVE JOBS API INTEGRATION

### API Source: SerpAPI (Google Jobs)
**Live Jobs Route** (`backend/src/routes/liveJobs.js`):

```javascript
router.get('/', async (req, res) => {
    try {
        const query = req.query.q || 'fresher developer';
        let allJobs = [];
        
        // Fallback if SerpAPI key not configured
        if (!process.env.SERPAPI_KEY) {
            console.warn('⚠️ SERPAPI_KEY not set; returning local sample jobs only');
            const { getAllJobs } = await import('../utils/database.js');
            const jobs = await getAllJobs();
            const filtered = jobs.filter(j => 
                j.title.toLowerCase().includes(query.toLowerCase())
            );
            return res.json({
                jobs: filtered,
                count: filtered.length,
                source: 'local_fallback'
            });
        }

        // Parallel search queries for fresher/internship jobs
        const searchVariations = [
            `${query} fresher internship India`,
            `${query} intern entry level India`,
            `internship ${query} India`,
            `fresher ${query} job India`,
            `junior ${query} India`,
            `${query} 0-1 year India`
        ];
        
        const seenJobIds = new Set();
        let serpError = null;
        
        // Execute all requests in parallel
        const requests = searchVariations.map((searchQuery, idx) => 
            new Promise((resolve) => {
                getJson({
                    engine: 'google_jobs',
                    q: searchQuery,
                    location: 'India',
                    num: 30,
                    api_key: process.env.SERPAPI_KEY,
                    timeout: 5000
                }).then(response => {
                    if (response?.error) {
                        serpError = response.error;
                        return resolve();
                    }
                    if (response?.jobs_results) {
                        for (const job of response.jobs_results) {
                            const uniqueId = `${job.title || ''}_${job.company_name || ''}`.toLowerCase();
                            if (!seenJobIds.has(uniqueId)) {
                                seenJobIds.add(uniqueId);
                                allJobs.push(job);
                            }
                        }
                    }
                    resolve();
                }).catch(err => {
                    console.warn(`⚠️ Search variation ${idx + 1}/6 failed`);
                    resolve();
                });
            })
        );
        
        // Wait for all parallel requests (with timeout)
        await Promise.race([
            Promise.all(requests),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 12000)
            )
        ]).catch(err => {
            console.warn('⚠️ Some API requests timed out');
        });

        if (!allJobs || allJobs.length === 0) {
            return res.json({ jobs: [], message: 'No fresher/internship jobs found in India' });
        }

        // Filter for fresher/entry-level roles
        const liveJobs = allJobs
            .filter(job => {
                const jobText = (job.title + ' ' + (job.description || '')).toLowerCase();
                return jobText.includes('fresher') || 
                       jobText.includes('intern') || 
                       jobText.includes('entry') || 
                       jobText.includes('graduate') ||
                       jobText.includes('trainee') ||
                       jobText.includes('0-1 year') ||
                       jobText.includes('0-2 year') ||
                       jobText.includes('campus') ||
                       jobText.includes('training');
            })
            .slice(0, 20)
            .map((job, idx) => {
                const description = job.description || '';
                return {
                    id: `live_${idx}_${Date.now()}`,
                    title: job.title || 'Job Title',
                    company: job.company_name || 'Company',
                    location: job.location || 'India',
                    description: description,
                    requirements: extractSkillsFromText(description),
                    experience_level: 'fresher',
                    salary: job.salary_range || 'Stipend/Salary TBD',
                    posted_date: new Date().toISOString(),
                    apply_link: job.apply_options?.[0]?.link || job.job_link || '#',
                    source: 'google_jobs_india'
                };
            });
        
        return res.json({
            jobs: liveJobs,
            count: liveJobs.length,
            source: 'google_jobs_india'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

### Integration in Resume Analysis Flow
From `backend/src/routes/resume.js`:

```javascript
const searchVariations = [
    `fresher ${topSkills.join(' ')} internship India`,
    `${topSkills[0]} intern entry level India`,
    `${topSkills[0]} graduate trainee India`,
    `internship ${topSkills[0]} ${topSkills[1]} India`,
    `${topSkills[1]} fresher job India`,
    `${topSkills[2] || 'developer'} internship India`,
    `fresher internship India ${topSkills[0]}`,
    `entry level ${topSkills[0]} India`,
    `junior ${topSkills[1]} India trainee`,
    `${topSkills[0]} ${topSkills[2]} fresher India`
];

const seenJobIds = new Set();

try {
    for (let idx = 0; idx < searchVariations.length; idx++) {
        const searchQuery = searchVariations[idx];
        try {
            const liveResponse = await getJson({
                engine: 'google_jobs',
                q: searchQuery,
                location: 'India',
                api_key: process.env.SERPAPI_KEY,
                num: 40
            });

            if (liveResponse?.error) {
                serpError = liveResponse.error;
                continue;
            }

            if (liveResponse.jobs_results) {
                for (const job of liveResponse.jobs_results) {
                    const uniqueId = `${job.title}_${job.company_name}`.toLowerCase();
                    if (!seenJobIds.has(uniqueId)) {
                        seenJobIds.add(uniqueId);
                        liveJobs.push(job);
                    }
                }
            }

            await new Promise(r => setTimeout(r, 200));

        } catch (err) {
            // Continue with next variation
        }
    }
} catch (liveErr) {
    console.error("Live job fetch error:", liveErr.message);
}
```

### Environment Configuration
Required in `.env`:
```env
SERPAPI_KEY=your_serpapi_key_here
```

### Live Job to Database Storage
When live jobs are matched with resume, they're inserted into the jobs table:

```javascript
async function insertLiveJob(liveJobData) {
    try {
        const { title, company, location, description, requirements, 
                experience_level, salary, posted_date, apply_link, source } = liveJobData;
        
        const result = await pool.query(
            `INSERT INTO jobs (title, company, location, description, experience_level, salary, apply_link, posted_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             ON CONFLICT (title, company) DO UPDATE SET posted_date=EXCLUDED.posted_date 
             RETURNING id`,
            [title, company, location || 'India', description || '', 
             experience_level || 'fresher', salary || 'TBD', apply_link || '#', 
             posted_date || new Date()]
        );
        
        const jobId = result.rows[0].id;
        
        // Insert requirements
        if (Array.isArray(requirements) && requirements.length > 0) {
            for (const req of requirements) {
                await pool.query(
                    `INSERT INTO job_requirements (job_id, requirement) VALUES ($1, $2) 
                     ON CONFLICT DO NOTHING`,
                    [jobId, req]
                );
            }
        }
        
        return jobId;
    } catch (err) {
        console.error('Error inserting live job:', err);
        throw err;
    }
}
```

### Response Format
```json
{
    "jobs": [
        {
            "id": "live_0_1711234567890",
            "title": "JavaScript Intern",
            "company": "Tech Startup",
            "location": "Bangalore, India",
            "description": "Looking for fresher interns with JavaScript knowledge...",
            "requirements": ["JavaScript", "React", "Node.js"],
            "experience_level": "fresher",
            "salary": "₹10,000 - ₹15,000 per month",
            "posted_date": "2024-03-25T10:30:00.000Z",
            "apply_link": "https://company.com/apply",
            "source": "google_jobs_india"
        }
    ],
    "count": 15,
    "source": "google_jobs_india",
    "location": "India"
}
```

---

## SUMMARY TABLE

| Component | Location | Current Count | Storage | Status |
|-----------|----------|----------------|---------|--------|
| **Skills Data** | `backend/data/skills.json` | 60+ skills | JSON File | Static |
| **Sample Jobs** | PostgreSQL `jobs` table | Dynamic (0-100+) | Database | Created via API |
| **Resumes** | PostgreSQL `resumes` table | Variable | Database | User uploads |
| **Job Matches** | PostgreSQL `job_matches` table | Variable | Database | Calculated post-upload |
| **Live Jobs** | SerpAPI (Google Jobs) | 0-40 per search | External API | Dynamic |

---

## API ENDPOINTS SUMMARY

```
POST /api/resume/analyze
  - Upload PDF resume
  - Returns: skills, categorized_skills, local_matches, live_matches, analysis

GET /api/jobs
  - Fetch all local jobs from database
  - Returns: array of job objects with requirements

POST /api/jobs
  - Create new job posting
  - Body: {title, company, location, description, requirements, experience_level, salary}

GET /api/live-jobs?q=<search query>
  - Fetch live jobs from SerpAPI
  - Returns: array of live job objects from Google Jobs

GET /api/statistics
  - Get analytics about jobs, resumes, skills
  - Returns: total_jobs, total_resumes, jobs_by_level, top_skills
```
