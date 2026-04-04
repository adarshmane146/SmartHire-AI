/**
--This script manages the frontend job listing feature of the portal. 
--It fetches job data from the backend API, dynamically displays job details such as title, company, location, required skills, salary, and experience level, and provides an apply button for users. 
--It also allows administrators to delete job postings and automatically reloads the job list when the page loads.
 * ========================================
 * Jobs Management Module
 * Handles job listing and filtering
 * ========================================
 */

const jobsList = document.getElementById('jobsList');

/**
 * Load and display all jobs
 */
async function loadJobs() {
    try {
        const response = await fetch(API_BASE_URL + '/api/jobs', {
            headers: {
                ...getAuthHeaders()
            }
        });
        const jobs = await response.json();
        
        if (jobs.length === 0) {
            if (jobsList) jobsList.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 20px;">No sample positions available yet.</p>';
            return;
        }
        
        if (jobsList) jobsList.innerHTML = '';
        jobs.forEach(job => {
            if (jobsList) {
                jobsList.innerHTML += `
                    <div class="job-card">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div>
                                <div class="job-title">${job.title}</div>
                                <div class="job-company">${job.company}</div>
                                <div class="job-location">📍 ${job.location}</div>
                            </div>
                            <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 600;">📌 SAMPLE</span>
                        </div>
                        ${job.description ? `<div class="job-desc">${job.description}</div>` : ''}
                        <div style="margin-top: 10px;">
                            <div class="skills-section">
                                <div class="skills-label">Required Skills</div>
                                ${job.requirements.map(s => `<span class="skill-pill">${s}</span>`).join('')}
                            </div>
                        </div>
                        <div style="margin-top: 10px; color: #9ca3af; font-size: 0.9em;">
                            💰 ${job.salary} | 👨‍🎓 ${job.experience_level.toUpperCase()}
                        </div>
                        <button class="apply-btn" onclick="applyForJob('${job.id}', '${job.title}', '${job.company}', '${job.apply_link || ''}')">🔗 Apply Now</button>
                    </div>
                `;
            }
        });
    } catch (err) {
        if (jobsList) jobsList.innerHTML = `<div class="error">Error loading jobs: ${err.message}</div>`;
    }
}

/**
 * Delete a job (admin only)
 */
async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
        const response = await fetch(API_BASE_URL + `/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders()
            }
        });
        
        const result = await response.json();
        if (result.success) {
            showSuccess('Job deleted successfully');
            loadJobs();
        }
    } catch (err) {
        showError('Error deleting job: ' + err.message);
    }
}

/**
 * Load jobs on tab switch
 */
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
});
