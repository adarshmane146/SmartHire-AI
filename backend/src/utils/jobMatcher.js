/**
--This module calculates the match percentage between a user’s skills and job requirements.
--It compares the skills extracted from the resume with the required skills of each job and identifies matched and missing skills. 
--Based on this comparison, it generates a match percentage, helping the system recommend the most relevant job opportunities for the user.
 * Job Matching Utility
 * Calculates match percentage between user skills and job requirements
 */
/**
--This module calculates the match percentage between a user’s skills and job requirements.
--It compares the skills extracted from the resume with the required skills of each job and identifies matched and missing skills. 
--Based on this comparison, it generates a match percentage, helping the system recommend the most relevant job opportunities for the user.

 * Job Matching Utility
 * Calculates match percentage between user skills and job requirements
 */

/**
 * Calculate match between user skills and job requirements
 * @param {array} userSkills - Array of user's skills
 * @param {array} jobRequirements - Array of job required skills
 * @returns {object} Match data with percentage and matched/missing skills
 */

function calculateMatch(userSkills = [], jobRequirements = []) {

    // Ensure arrays
    if (!Array.isArray(userSkills)) userSkills = [];
    if (!Array.isArray(jobRequirements)) jobRequirements = [];

    // Handle empty job requirements (fresher friendly)
    if (jobRequirements.length === 0) {
        return {
            matched: [],
            missing: [],
            percentage: 30,
            total_required: 1
        };
    }

    // Convert user skills to lowercase safely
    const userSkillsLower = userSkills
        .filter(skill => typeof skill === "string")
        .map(skill => skill.toLowerCase());

    const matched = [];
    const missing = [];

    for (let req of jobRequirements) {

        // Skip invalid requirement values
        if (typeof req !== "string") {
            continue;
        }

        const requirement = req.toLowerCase();

        if (userSkillsLower.includes(requirement)) {
            matched.push(req);
        } else {
            missing.push(req);
        }
    }

    // Calculate percentage
    let percentage = Math.round((matched.length / jobRequirements.length) * 100);

    // Ensure fresher jobs still appear even if no skill matches
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

export {
    calculateMatch
};