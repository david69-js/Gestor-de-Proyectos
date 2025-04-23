const { getConnection } = require('../config/db');

async function getProjectProgressReport(projectId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_proyecto', projectId)
            .execute('sp_GetProjectProgressReport');
        
        return result.recordset;
    } catch (error) {
        console.error('Error generating project progress report:', error);
        throw error;
    }
}

async function getTimeTrackingReport(userId, startDate, endDate) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', userId)
            .input('startDate', startDate)
            .input('endDate', endDate)
            .execute('sp_GetTimeTrackingReport');
        
        return result.recordset;
    } catch (error) {
        console.error('Error generating time tracking report:', error);
        throw error;
    }
}

async function getUserParticipationReport(organizationId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('organizationId', organizationId)
            .execute('sp_GetUserParticipationReport');
        
        return result.recordset;
    } catch (error) {
        console.error('Error generating user participation report:', error);
        throw error;
    }
}

module.exports = {
    getProjectProgressReport,
    getTimeTrackingReport,
    getUserParticipationReport
};