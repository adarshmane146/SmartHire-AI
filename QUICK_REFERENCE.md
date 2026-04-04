# ATS Portal - Quick Reference Guide

## Current Data Architecture

### 1. Job Storage Location
**Primary**: PostgreSQL `jobs` table
**Secondary**: SerpAPI (live Google Jobs)
**Fallback**: Local jobs when SerpAPI unavailable

**Current Count**: 
- Local jobs: `0-100+` (dynamic, user-created via API)
- Live jobs: `0-40` per API call (fetched on-demand)

### 2. Resume Upload Flow - Step by Step

```
USER UPLOAD
    ↓
POST /api/resume/analyze (multipart/form-data)
    ↓
Backend receives file in memory (multer)
    ↓
Extract PDF text → Extract skills → Categorize skills
    ↓
Fetch ALL jobs from database
    ↓
Search LIVE jobs via SerpAPI (10 search variations)
    ↓
Calculate match % for each job (local + live)
    ↓
Save resume analysis + job matches to database
    ↓
Return results to frontend
```

### 3. Key Database Tables

```sql
-- Users (authentication)
users (id, name, email, password, created_at)

-- Jobs (local job postings)
jobs (id, title, company, location, description, 
      experience_level, salary, apply_link, posted_date)

-- Job Requirements (many-to-many)
job_requirements (id, job_id, requirement)

-- Resumes (user uploads)
resumes (id, user_id, filename, timestamp)

-- Resume Skills (many-to-many)
resume_skills (id, resume_id, skill_name, category)

-- Job Matches (calculated after upload)
job_matches (id, resume_id, job_id, match_percentage, match_data)
```

---

## Key Code Snippets by Feature

### A. RESUME UPLOAD ENDPOINT

**Route**: `POST /api/resume/analyze`

**Middleware Stack**:
```javascript
app.use("/api/resume", upload.single("resume"), resumeRoutes);
// upload = multer with memoryStorage
```

**Handler**:
```javascript
router.post('/analyze', async (req, res) => {
    // 1. Check file exists
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    // 2. Extract JWT user ID
    let userId = null;
    const token = req.headers.authorization?.split(" ")[1];
    if (token) userId = jwt.verify(token, JWT_SECRET).id;
    
    // 3. Extract text from PDF
    pdfExtract.extractBuffer(req.file.buffer, {}, async (err, data) => {
        const fullText = data.pages.map(p => 
            p.content.map(i => i.str).join(' ')
        ).join(' ');
        
        // 4. Extract & categorize skills
        const userSkills = extractSkills(fullText);
        const categorizedSkills = categorizeSkills(userSkills);
        
        // 5. Get local jobs & live jobs
        const localJobs = await getAllJobs();
        const liveJobs = await searchLiveJobs(userSkills);
        
        // 6. Calculate matches
        const localMatches = localJobs.map(job => ({
            ...job,
            match_percentage: calculateMatch(userSkills, job.requirements).percentage,
            source: "local"
        }));
        
        const liveMatches = liveJobs.map(job => ({
            ...job,
            match_percentage: calculateMatch(userSkills, job.requirements).percentage,
            source: "live"
        }));
        
        // 7. Save to database
        const resumeData = await saveResume({ user_id, filename, skills });
        await saveJobMatches(resumeData.id, [...localMatches, ...liveMatches]);
        
        // 8. Return results
        res.json({ user_skills, categorized_skills, localMatches, liveMatches });
    });
});
```

---

### B. LIVE JOBS API INTEGRATION

**Route**: `GET /api/live-jobs?q=<search_term>`

**Configuration Required**:
```env
SERPAPI_KEY=your_api_key_here
```

**Search Strategy**:
```javascript
const searchVariations = [
    `${query} fresher internship India`,
    `${query} intern entry level India`,
    `internship ${query} India`,
    `fresher ${query} job India`,
    `junior ${query} India`,
    `${query} 0-1 year India`
];

// Execute parallel requests
const requests = searchVariations.map(query => 
    getJson({
        engine: 'google_jobs',
        q: query,
        location: 'India',
        num: 30,
        api_key: process.env.SERPAPI_KEY
    })
);

await Promise.race([
    Promise.all(requests),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))
]);
```

**Fallback When SerpAPI Unavailable**:
```javascript
if (!process.env.SERPAPI_KEY) {
    const jobs = await getAllJobs();  // Return local jobs only
    return res.json({ jobs, source: 'local_fallback' });
}
```

---

### C. JOB MATCHING ALGORITHM

**Location**: `backend/src/utils/jobMatcher.js`

**Simple & Effective**:
```javascript
function calculateMatch(userSkills = [], jobRequirements = []) {
    if (jobRequirements.length === 0) return { percentage: 30 };
    
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const matched = [];
    const missing = [];
    
    for (let req of jobRequirements) {
        if (userSkillsLower.includes(req.toLowerCase())) {
            matched.push(req);
        } else {
            missing.push(req);
        }
    }
    
    let percentage = Math.round((matched.length / jobRequirements.length) * 100);
    if (percentage === 0 && jobRequirements.length > 0) {
        percentage = 15;  // Minimum for fresher jobs
    }
    
    return { matched, missing, percentage, total_required: jobRequirements.length };
}
```

**Usage**:
```javascript
const match = calculateMatch(
    ["JavaScript", "React", "Node.js"],
    ["JavaScript", "React", "MongoDB", "Docker"]
);
// Returns: { matched: ["JavaScript", "React"], 
//            missing: ["MongoDB", "Docker"], 
//            percentage: 50 }
```

---

### D. SKILL EXTRACTION

**Location**: `backend/data/skills.json` + `backend/src/utils/skillExtractor.js`

**Available Skills** (60+ technical skills organized in 8 categories):
```json
{
  "languages": ["JavaScript", "Python", "Java", "C++", "C#", "TypeScript", ...],
  "frontend": ["React", "Vue", "Angular", "HTML", "CSS", "Tailwind", ...],
  "backend": ["Node.js", "Express", "Django", "Flask", "Spring", ...],
  "databases": ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", ...],
  "cloud": ["AWS", "Azure", "GCP", "Heroku", "DigitalOcean", ...],
  "devops": ["Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub", ...],
  "tools": ["Git", "VS Code", "Postman", "Jira", "NPM", ...],
  "soft_skills": ["Communication", "Leadership", "Problem Solving", ...]
}
```

**Extraction with Aliases**:
```javascript
const skillAliases = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'node.js': 'Node.js',
    'react.js': 'React',
    'express.js': 'Express',
    'springboot': 'Spring Boot',
    // ... more aliases
};

function extractSkills(text) {
    const foundSkills = new Map();
    
    // Direct match
    for (const skill of allSkills) {
        if (containsSkill(text, skill)) {
            foundSkills.set(skill, marketDemand[skill] || 50);
        }
    }
    
    // Alias match
    for (const [alias, skill] of Object.entries(skillAliases)) {
        if (containsSkill(text, alias)) {
            if (!foundSkills.has(skill)) {
                foundSkills.set(skill, marketDemand[skill] || 50);
            }
        }
    }
    
    return [...foundSkills.keys()];
}
```

---

### E. GETTING JOB COUNT

**Method 1: API Endpoint**
```bash
GET /api/jobs
# Returns array, length = job count
```

**Method 2: Statistics Endpoint**
```bash
GET /api/statistics
# Response includes "total_jobs": number
```

**Method 3: Direct Database Query**
```javascript
async function getAllJobs() {
    const result = await pool.query(
        `SELECT j.id, j.title, j.company, ...,
                COALESCE(json_agg(...) FILTER (WHERE jr.id IS NOT NULL), '[]') as requirements
         FROM jobs j
         LEFT JOIN job_requirements jr ON j.id = jr.job_id
         GROUP BY j.id
         ORDER BY j.posted_date DESC`
    );
    return result.rows;  // Array length = count
}

const jobs = await getAllJobs();
const count = jobs.length;
```

**Sample Count Breakdown** (from statistics):
```json
{
  "total_jobs": 42,
  "jobs_by_level": {
    "fresher": 28,
    "mid": 10,
    "senior": 4
  },
  "total_resumes_analyzed": 156,
  "top_skills": [
    {"skill": "JavaScript", "count": 142},
    {"skill": "React", "count": 98},
    {"skill": "PostgreSQL", "count": 67}
  ]
}
```

---

### F. EXAMPLE FRONTEND USAGE

**Resume Upload**:
```javascript
async function processResume() {
    const formData = new FormData();
    formData.append('resume', fileInput.files[0]);
    
    const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    
    const data = await response.json();
    
    // Display results
    console.log(`Skills found: ${data.user_skills.length}`);
    console.log(`Local matches: ${data.local_matches.length}`);
    console.log(`Live matches: ${data.live_matches.length}`);
    
    // Show best match
    const best = Math.max(...data.all_matches.map(m => m.match_percentage));
    console.log(`Best match: ${best}%`);
}
```

**Fetch Live Jobs**:
```javascript
async function getLiveJobs(skill) {
    const response = await fetch(`/api/live-jobs?q=${skill}`);
    const data = await response.json();
    
    console.log(`Live jobs found: ${data.count}`);
    console.log(`Source: ${data.source}`);
    
    data.jobs.forEach(job => {
        console.log(`${job.title} @ ${job.company} - ${job.salary}`);
    });
}
```

---

## Performance Notes

- **Resume Processing**: ~2-5 seconds per PDF
- **Local Job Matching**: <500ms (in-memory array operations)
- **Live Job Fetching**: ~3-8 seconds (10 parallel SerpAPI requests with 200ms delays)
- **Database**: PostgreSQL with indexes on frequently queried columns

## Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| No live jobs appearing | `SERPAPI_KEY` not set | Add key to `.env` and restart |
| Resume upload fails | PDF parsing error | Ensure valid PDF with text content |
| Long processing time | Too many API calls | Reduce search variations |
| Empty job requirements | No skills extracted | Ensure job description has skill mentions |
| Low match percentages | Skill aliases missing | Add to `skillAliases` object |

---

## Testing Quick Commands

```bash
# Get job count
curl http://localhost:3000/api/jobs | jq length

# Get statistics
curl http://localhost:3000/api/statistics

# Get live jobs
curl "http://localhost:3000/api/live-jobs?q=javascript"

# Post a job (manual)
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "company": "TechCorp",
    "description": "Looking for React expert",
    "requirements": ["React", "JavaScript", "CSS"],
    "experience_level": "fresher"
  }'
```
