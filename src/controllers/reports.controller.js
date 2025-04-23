const { getConnection } = require('../config/db');

async function getProjectProgressReport(projectId, organizationId = null) {
    try {
        const pool = await getConnection();
        const request = pool.request()
            .input('id_proyecto', projectId);
        
        if (organizationId) {
            request.input('id_organizacion', organizationId);
        }
        
        const result = await request.execute('sp_GetProjectProgressReport');
        return result.recordset;
    } catch (error) {
        console.error('Error generating project progress report:', error);
        throw error;
    }
}

async function getTimeTrackingReport(userId, startDate, endDate, projectId = null) {
    try {
        const pool = await getConnection();
        const request = pool.request()
            .input('userId', userId)
            .input('startDate', startDate)
            .input('endDate', endDate);
        
        if (projectId) {
            request.input('projectId', projectId);
        }
        
        const result = await request.execute('sp_GetTimeTrackingReport');
        return result.recordset;
    } catch (error) {
        console.error('Error generating time tracking report:', error);
        throw error;
    }
}

async function getUserParticipationReport(organizationId, projectId = null) {
    try {
        const pool = await getConnection();
        const request = pool.request()
            .input('organizationId', organizationId);
        
        if (projectId) {
            request.input('projectId', projectId);
        }
        
        const result = await request.execute('sp_GetUserParticipationReport');
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