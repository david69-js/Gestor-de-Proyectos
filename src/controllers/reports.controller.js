const { getConnection } = require('../config/db');

async function getProjectProgressReport(projectId, organizationId) {
    try {
        const pool = await getConnection();
        const request = pool.request()
            .input('id_proyecto', projectId)
            .input('id_organizacion', organizationId);
        
        
        const result = await request.execute('sp_GetProjectProgressReport');
        return result.recordset;
        
    } catch (error) {
        console.error('Error generating project progress report:', error);
        throw error;
    }
}
module.exports = {
    getProjectProgressReport,
};