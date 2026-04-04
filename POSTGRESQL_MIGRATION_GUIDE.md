# PostgreSQL Migration Guide

## Overview
Your ATS Job Portal has been successfully migrated from JSON files and localStorage to PostgreSQL database. This guide will help you set up and run the migrated application.

## What Changed

### Backend
- **database.js**: Completely refactored to use PostgreSQL `pg` package instead of file system operations
- **auth.js**: Updated to use async database operations
- **jobs.js**: Updated with async database calls
- **resume.js**: Updated to save resume analysis and job matches to PostgreSQL
- **server.js**: Removed JSON file initialization calls

### Frontend
- ✅ **localStorage usage preserved**: Still used only for JWT token storage (authentication)
- ✅ **No changes needed**: Frontend already uses API calls for all data operations

### Database
- New PostgreSQL schema with 8 tables for users, jobs, resumes, skills, and job matches
- Automatic UUID generation for primary keys
- Foreign key relationships for data integrity
- Performance indexes on frequently queried columns

## Prerequisites

### 1. Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql@15`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Create Database and User

After PostgreSQL is installed, open PostgreSQL shell (psql) and run:

```sql
-- Create database
CREATE DATABASE ats_portal;

-- Create user with password
CREATE USER postgres WITH PASSWORD 'postgres';

-- Grant privileges (optional - for default postgres user, usually pre-configured)
ALTER ROLE postgres SUPERUSER CREATEDB CREATEROLE;
```

### 3. Run Schema Setup

In your project, run the SQL schema file to create all tables:

```bash
# Using psql directly
psql -U postgres -d ats_portal -f backend/db/schema.sql

# Or connect to database and run script
psql -U postgres -d ats_portal
# Then in psql: \i backend/db/schema.sql
```

Alternatively, copy-paste the contents of `backend/db/schema.sql` into pgAdmin or your PostgreSQL client.

## Installation

### 1. Install Dependencies
```bash
# Root directory
npm install
```

### 2. Configure Environment Variables

Verify `.env` file contains:
```env
# Backend API
PORT=3000

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ats_portal

# API Keys
SERPAPI_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints (No Changes)

All existing API endpoints work as before:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Add new job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/resume/analyze` - Analyze resume and get job matches

## Database Structure

### Tables
1. **users** - User accounts (id, name, email, password, created_at)
2. **jobs** - Job postings (id, title, company, location, description, salary, posted_date)
3. **job_requirements** - Skills required for each job (job_id, requirement)
4. **skills** - Skill master data (skill_name, category)
5. **resumes** - Uploaded resumes (id, user_id, filename, timestamp)
6. **resume_skills** - Skills extracted from resumes (resume_id, skill_name, category)
7. **job_matches** - Match data between resumes and jobs (resume_id, job_id, match_percentage)

## Migration from Old Files

### Option 1: Manual Data Migration
If you have existing data to migrate from JSON files:

```javascript
// Simple migration script (run once)
import fs from 'fs';
import { pool } from './backend/src/utils/database.js';

async function migrateData() {
    // Read old JSON files
    const oldUsers = JSON.parse(fs.readFileSync('./backend/data/users.json'));
    const oldJobs = JSON.parse(fs.readFileSync('./backend/data/jobs.json'));
    const oldResumes = JSON.parse(fs.readFileSync('./backend/data/resumes.json'));
    
    // Insert data into PostgreSQL
    for (const user of oldUsers) {
        await pool.query(
            'INSERT INTO users (id, name, email, password, created_at) VALUES ($1, $2, $3, $4, $5)',
            [user.id, user.name, user.email, user.password, user.created_at]
        );
    }
    console.log('✅ Migration completed');
}

migrateData();
```

### Option 2: Start Fresh
Delete old JSON files and start with a clean PostgreSQL database. Default sample jobs will be loaded on first API call if needed.

## Troubleshooting

### Connection Error: "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL is not running. Start the service:
  - **Windows**: Services > PostgreSQL > Start
  - **Mac**: `brew services start postgresql`
  - **Linux**: `sudo systemctl start postgresql`

### Database Not Found
- Ensure `ats_portal` database exists: `psql -U postgres -l | grep ats_portal`
- If missing, create it: `psql -U postgres -c "CREATE DATABASE ats_portal;"`

### Authentication Failed
- Check `.env` file DB_USER and DB_PASSWORD match your PostgreSQL setup
- Reset PostgreSQL password if needed

### Schema Not Created
- Run: `psql -U postgres -d ats_portal -f backend/db/schema.sql`
- Check for error messages in output

## Testing the Migration

### 1. Test Database Connection
```bash
# In psql
psql -U postgres -d ats_portal
# Type: SELECT COUNT(*) FROM users;
# Should return: 0 (empty table)
```

### 2. Test API
```bash
# In terminal
curl http://localhost:3000/api/jobs

# Should return empty array: []
```

### 3. Test Full Flow
1. Visit `http://localhost:3000/signup.html`
2. Create a new account
3. Login with credentials
4. Upload a resume
5. Check if resume analysis is saved

## Performance Notes

✅ **Improved** over JSON:
- Faster queries with database indexes
- Support for concurrent users
- Transaction support for data consistency
- ACID compliance for reliability

## Next Steps

### 1. Load Initial Jobs
You can seed the database with sample job data if needed using a migration script.

### 2. Backup Strategy
Create regular PostgreSQL backups:
```bash
pg_dump -U postgres ats_portal > backup.sql
```

### 3. Deploy to Production
- Move credentials from `.env` to environment variables
- Use connection pooling (already implemented)
- Set up database backups
- Configure SSL for PostgreSQL connections

## Support Files

- `backend/db/schema.sql` - PostgreSQL schema
- `backend/src/utils/database.js` - Database connection & operations
- `.env` - Environment configuration
- `package.json` - Updated with `pg` package

## Important Notes

✅ **Preserved**:
- All existing API endpoints remain unchanged
- Frontend code works as-is (localStorage still used for JWT tokens)
- All features and functionality remain the same

✅ **Improved**:
- Better data persistence
- No file I/O overhead
- Full transaction support
- Concurrent user support

🔄 **No longer needed**:
- `backend/data/` JSON files (can be archived/deleted)
- JSON file watchers
- Manual file synchronization

---

**Last Updated**: March 25, 2026
