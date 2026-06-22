/**
 * Live Jobs Module (live-jobs.js)
--This module fetches real-time fresher and internship job listings in India using the Google Jobs API via SerpAPI. 
--It sends multiple search queries in parallel to retrieve job results quickly, filters them for entry-level roles, and extracts required skills from job descriptions. 
--The system then formats the job data and returns a list of live job opportunities with details such as title, company, location, salary, and apply link.
 * Live Jobs Routes
 * Fetches real jobs from Google Jobs API via SerpAPI
 */ 

import express from 'express';
import { getJson } from 'serpapi';
import { extractSkillsFromText } from '../utils/skillExtractor.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 
 * GET /api/live-jobs
 * Fetch LIVE India fresher/internship jobs from Google Jobs API
 * Uses parallel requests for speed
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = req.query.q || 'fresher developer'; 
        let allJobs = [];
        
        // if there is no SerpAPI key configured, skip external lookups and
        // simply return local sample jobs (filtered by query) so the front end
        // never gets an empty result set.
        if (!process.env.SERPAPI_KEY) {
            console.warn('⚠️ SERPAPI_KEY not set; returning local sample jobs only');
            // load local jobs directly from imported module to avoid circular
            // require issues; require here for simplicity
            const { getAllJobs } = await import('../utils/database.js');
            const jobs = getAllJobs();
            const filtered = jobs.filter(j => j.title.toLowerCase().includes(query.toLowerCase()));
            return res.json({
                jobs: filtered.map((job, idx) => ({
                    ...job,
                    id: `local_${idx}_${Date.now()}`
                })),
                count: filtered.length,
                source: 'local_fallback',
                location: 'India',
                message: 'SerpAPI key not configured; showing sample jobs only'
            });
        }

        // Reduced but focused search variations (6 searches instead of 12) - parallel execution
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
        
        // Make all requests in parallel instead of sequential
        const requests = searchVariations.map((searchQuery, idx) => 
            new Promise((resolve) => {
                getJson({
                    engine: 'google_jobs',
                    q: searchQuery,
                    location: 'India',
                    num: 30,  // Reduced from 40
                    api_key: process.env.SERPAPI_KEY,
                    timeout: 5000  // 5 second timeout per request
                }).then(response => {
                    if (response?.error) {
                        // API returned a semantic error (e.g. invalid key)
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
                    const msg = err.message || err.toString();
                    console.warn(`⚠️ Search variation ${idx + 1}/6 API failed: "${searchQuery}"`);
                    console.warn(`   ${msg}`);
                    if (!serpError) serpError = msg;
                    resolve();  // Don't fail entire request, just skip this variation
                });
            })
        );
        
        // Wait for all requests to complete (with timeout)
        await Promise.race([
            Promise.all(requests),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 12000))
        ]).catch(err => {
            console.warn('⚠️ Some API requests timed out, returning partial results');
        });

        if (!allJobs || allJobs.length === 0) {
            let msg = 'No fresher/internship jobs found in India';
            if (serpError) msg += ` (API error: ${serpError})`;
            return res.json({ jobs: [], message: msg });
        }

        // Filter for fresher/internship roles only
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
            .slice(0, 40)  // Return 40 fresh live jobs from API
            //it helps to return jobs in  LIVE India Fresher & Internship Opportunities
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
        
        // Randomize order and refresh IDs/post dates
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        const now = Date.now();
        const randomized = shuffle(liveJobs).map((j, i) => ({
            ...j,
            id: `${j.source || 'live'}_${i}_${now}`,
            posted_date: new Date(now).toISOString()
        }));

        console.log(`✅ Returning ${liveJobs.length} live fresher/internship jobs for query: "${query}"`);
        
        const payload = {
            jobs: liveJobs,
            count: liveJobs.length,
            source: 'Google Jobs API - India Fresher/Internship',
            location: 'India'
        };
        if (serpError) payload.message = `Partial results: ${serpError}`;
        res.json(payload);
    } catch (err) {
        console.error('Live Jobs Error:', err.message);
        res.status(500).json({ error: 'Could not fetch live jobs', details: err.message });
    }
});

export default router;
