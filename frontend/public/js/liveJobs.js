
/**
This script fetches live fresher and internship job listings from the backend API based on a search query. 
It displays the jobs dynamically with details such as title, company, location, required skills, salary, and experience level, and provides an Apply Now button for users. 
It also shows a loading indicator while searching and handles errors if the job fetch fails. 
 * ========================================
 * Live Jobs Module
 * Fetches real fresher/internship jobs
 * ========================================
 */

async function fetchLiveJobs() {

    const query =
        document.getElementById("jobSearchQuery")?.value ||
        "developer fresher";

    const liveJobsList = document.getElementById("liveJobsList");

    if (!liveJobsList) return;

    try {

        liveJobsList.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <div class="loader"></div>
                <p style="color:#667eea;">Searching LIVE Fresher / Internship Jobs...</p>
            </div>
        `;

        const response = await fetch(
            API_BASE_URL + `/api/live-jobs?q=${encodeURIComponent(query)}`,
            { headers: { ...getAuthHeaders() } }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch live jobs");
        }

        const data = await response.json();

        if (!data.jobs || data.jobs.length === 0) {
            liveJobsList.innerHTML = `
                <p style="color:#9ca3af;padding:20px;">
                No fresher/internship jobs found.
                Try keywords like:
                developer, python, react, java.
                </p>
            `;
            return;
        }

        let html = `
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 20px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; color:#059669; font-weight: 600; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.05);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3001 16.2547 20.0093 17.9818C18.7185 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98233 16.07 2.86" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Successfully Found ${data.jobs.length} LIVE Matches
            </div>
        `;

        data.jobs.forEach(job => {

            const skills = (job.requirements || [])
                .slice(0,8)
                .map(s => `<span class="skill-pill">${s}</span>`)
                .join("");

            const description = job.description
                ? job.description.slice(0,300) + "..."
                : "";

            html += `
                <div class="job-card" style="border-left:5px solid #ef4444; background: linear-gradient(to right, #ffffff, #fcfcfc); box-shadow: 0 5px 20px rgba(0,0,0,0.03);">

                    <div style="display:flex;justify-content:space-between;align-items:start;">

                        <div style="flex:1;padding-right:15px;">
                            <div class="job-title">${job.title}</div>
                            <div class="job-company">${job.company}</div>
                            <div class="job-location">📍 ${job.location}</div>
                        </div>

                        <div class="live-badge">
                            LIVE
                        </div>

                    </div>

                    ${description
                        ? `<div class="job-desc">${description}</div>`
                        : ""
                    }

                    <div class="skills-section">
                        <div class="skills-label">Required Skills</div>
                        ${skills}
                    </div>

                    <div class="job-meta">
                        💰 ${job.salary || "Not disclosed"} |
                        👨‍🎓 ${(job.experience_level || "fresher").toUpperCase()}
                    </div>

                    <button class="apply-btn"
                        onclick="applyForJob(
                            '${job.id}',
                            '${job.title}',
                            '${job.company}',
                            '${job.apply_link || ""}'
                        )">

                        🔗 Apply Now

                    </button>

                </div>
            `;
        });

        liveJobsList.innerHTML = html;

    }
    catch(err) {

        console.error(err);

        liveJobsList.innerHTML = `
            <div class="error">
                Error fetching jobs: ${err.message}
            </div>
        `;
    }
}