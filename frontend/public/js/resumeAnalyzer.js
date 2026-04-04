/**
--This script manages the resume upload and analysis feature on the frontend. 
--It allows users to upload or drag-and-drop a PDF resume, sends the file to the backend API for processing, and displays the analysis results including detected skills, matched jobs, match percentage, and suggested skills to learn.
--It also shows both sample jobs and live job opportunities based on the user’s resume skills.
 * ========================================
 * Resume Analyzer Module
 * Handles resume upload and analysis
 * ========================================
 */

const fileInput = document.getElementById('fileInput');
const resultsDiv = document.getElementById('results');
const loading = document.getElementById('loading');
const analyzeBtn = document.getElementById('analyzeBtn');

// File drag and drop handlers
if (fileInput) {
    fileInput.addEventListener('change', function() {
        const filename = this.files[0]?.name || 'No file chosen';
        document.getElementById('fileStatus').textContent = filename;
    });

    document.querySelector('.upload-box').addEventListener('dragover', (e) => {
        e.preventDefault();
        document.querySelector('.upload-box').style.borderColor = '#764ba2';
        document.querySelector('.upload-box').style.background = '#f0f1ff';
    });

    document.querySelector('.upload-box').addEventListener('dragleave', (e) => {
        e.preventDefault();
        document.querySelector('.upload-box').style.borderColor = '#667eea';
        document.querySelector('.upload-box').style.background = '#f8f9ff';
    });

    document.querySelector('.upload-box').addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]?.type === 'application/pdf') {
            fileInput.files = e.dataTransfer.files;
            document.getElementById('fileStatus').textContent = e.dataTransfer.files[0].name;
        } else {
            alert('Please upload a PDF file');
        }
    });
}

/**
 * Process Resume Upload and Analysis
 */
async function processResume() {
    if (!fileInput.files[0]) return alert("Please select a PDF file.");
    
    const formData = new FormData();
    formData.append('resume', fileInput.files[0]);
    
    resultsDiv.innerHTML = '';
    showLoading(true);
    if (analyzeBtn) analyzeBtn.disabled = true;
    
    try {
        const response = await fetch(API_BASE_URL + '/api/resume/analyze', {
            method: 'POST',
            headers: {
                ...getAuthHeaders()
            },
            body: formData
        });
        
        const data = await response.json();
        showLoading(false);
        if (analyzeBtn) analyzeBtn.disabled = false;
        
        if (data.error) throw new Error(data.error);
        if (data.message) {
            // show warning but continue with results
            resultsDiv.innerHTML = `<div class="error-box"><h3>⚠️ Notice</h3><p>${data.message}</p></div>` + resultsDiv.innerHTML;
        }
        
        // Show analysis summary
        if (data.analysis) {
            const analysis = data.analysis;
            resultsDiv.innerHTML = `
                <div class="analysis-box">
                    <h3>📊 Your Analysis Summary</h3>
                    <p><strong>✅ Skills Found:</strong> ${analysis.total_skills_found}</p>
                    <p><strong>📌 Sample Jobs Matched:</strong> ${analysis.local_jobs_matched}</p>
                    <p><strong>🔴 LIVE India Fresher/Internship Jobs Matched:</strong> ${analysis.live_jobs_matched}</p>
                    <p><strong>📊 Total Matched Positions:</strong> ${analysis.total_matched}</p>
                    <p><strong>⭐ Best Match:</strong> ${analysis.best_match}%</p>
                    <p><strong>📈 Average Match:</strong> ${analysis.averageMatch}%</p>
                </div>
            `;
        }
        
        // Show skills
        if (data.user_skills && data.user_skills.length > 0) {
            let skillsHtml = '<h3>🎓 Your Skills Detected</h3>';
            if (data.categorized_skills) {
                for (let category in data.categorized_skills) {
                    if (data.categorized_skills[category].length > 0) {
                        skillsHtml += `<p><strong>${category.replace(/_/g, ' ')}:</strong> `;
                        skillsHtml += data.categorized_skills[category]
                            .map(s => `<span class="skill-pill matched">${s}</span>`)
                            .join('');
                        skillsHtml += '</p>';
                    }
                }
            }
            resultsDiv.innerHTML += `<div class="analysis-box">${skillsHtml}</div>`;
        }
        
        // Get all matches (live + local)
        const allMatches = data.all_matches || [];
        
        if (allMatches.length === 0) {
            resultsDiv.innerHTML += '<p style="text-align:center; color: #9ca3af; padding: 20px;">No matches found. Please upload a resume with relevant skills.</p>';
            return;
        }
        
        // Render ALL matched jobs
        resultsDiv.innerHTML += `<h3 style="margin-top: 30px; margin-bottom: 20px;">📋 All Matched Positions (${allMatches.length} opportunities)</h3>`;
        resultsDiv.innerHTML += '<p style="color: #667eea; font-size: 0.9em; margin-bottom: 15px;">🔴 Live jobs from Google Jobs API | 📌 Sample positions</p>';
        
        allMatches.forEach(job => {
            const match = job.match_data || {};
            let badgeClass = getMatchBadgeClass(match.percentage);
            
            const isLive = job.source === 'live' || job.source === 'google_jobs';
            const sourceBadge = isLive ? '🔴 LIVE' : '📌 SAMPLE';
            const borderColor = isLive ? '#ef4444' : '#667eea';
            
            resultsDiv.innerHTML += `
                <div class="job-card" style="border-left: 4px solid ${borderColor};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div class="match-badge ${badgeClass}">${match.percentage}% Match</div>
                        <span style="background: ${borderColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 600;">${sourceBadge}</span>
                    </div>
                    <div class="job-header">
                        <div>
                            <div class="job-title">${job.title}</div>
                            <div class="job-company">${job.company}</div>
                            <div class="job-location">📍 ${job.location}</div>
                        </div>
                    </div>
                    ${job.description ? `<div class="job-desc">${job.description.substring(0, 400)}${job.description.length > 400 ? '...' : ''}</div>` : ''}
                    <div style="margin-top: 15px;">
                        <div class="skills-section">
                            <div class="skills-label">✅ Your Matching Skills (${match.matched?.length || 0}/${match.total_required || 0})</div>
                            ${match.matched?.map(s => `<span class="skill-pill matched">${s}</span>`).join('') || '<span class="skill-pill">None</span>'}
                        </div>
                        ${match.missing && match.missing.length > 0 ? `
                            <div class="skills-section" style="margin-top: 10px;">
                                <div class="skills-label">📚 Skills to Learn</div>
                                ${match.missing.slice(0, 5).map(s => `<span class="skill-pill missing">${s}</span>`).join('')}
                                ${match.missing.length > 5 ? `<span class="skill-pill" style="background: #f3f4f6; color: #6b7280;">+${match.missing.length - 5} more</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div style="margin-top: 10px; color: #9ca3af; font-size: 0.9em;">
                        💰 ${job.salary} | 👨‍🎓 ${job.experience_level.toUpperCase()}
                    </div>
                    <button class="apply-btn" onclick="applyForJob('${job.id}', '${job.title}', '${job.company}', '${job.apply_link || ''}')">🔗 Apply Now</button>
                </div>
            `;
        });
        
    } catch(err) {
        showLoading(false);
        if (analyzeBtn) analyzeBtn.disabled = false;
        showError(err.message);
    }
}

/**
 * Apply for a job
 */
function applyForJob(jobId, jobTitle, company, applyLink) {
    if (applyLink && applyLink.trim() && applyLink !== '#') {
        window.open(applyLink, '_blank');
    } else {
        alert(`No application link available for: ${jobTitle} at ${company}\n\nThis is a sample position. Please check live job listings.`);
    }
}
