const { getConnection } = require('../config/db');

const crearAnuncio = async (id_proyecto, id_organizacion, id_usuario, titulo, descripcion) => {
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        const result = await transaction.request()
            .input('id_proyecto', id_proyecto)
            .input('id_organizacion', id_organizacion)
            .input('id_usuario', id_usuario)
            .input('titulo', titulo)
            .input('descripcion', descripcion)
            .execute('sp_CrearAnuncio');
        
        await transaction.commit();
        return result.recordset[0];
    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    }
};

const obtenerAnunciosPorProyecto = async (id_proyecto, id_organizacion) => {
    const pool = await getConnection();
    // No necesitamos transacción para operaciones de solo lectura
    try {
        const result = await pool.request()
            .input('id_proyecto', id_proyecto)
            .input('id_organizacion', id_organizacion)
            .execute('sp_ObtenerAnunciosPorProyecto');
        
        return result.recordset;
    } catch (error) {
        throw new Error(error.message);
    }
};

const obtenerAnuncio = async (id_anuncio, id_organizacion, id_proyecto) => {
    const pool = await getConnection();
    // No necesitamos transacción para operaciones de solo lectura
    try {
        const result = await pool.request()
            .input('id_anuncio', id_anuncio)
            .input('id_organizacion', id_organizacion)
            .input('id_proyecto', id_proyecto)
            .execute('sp_ObtenerAnuncio');
        
        return result.recordset[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

const eliminarAnuncio = async (id_anuncio, id_proyecto, id_organizacion, id_usuario) => {
    const pool = await getConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        const result = await transaction.request()
            .input('id_anuncio', id_anuncio)
            .input('id_proyecto', id_proyecto)
            .input('id_organizacion', id_organizacion)
            .input('id_usuario', id_usuario)
            .execute('sp_EliminarAnuncio');
        
        await transaction.commit();
        return result.recordset[0];
    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    }
};

module.exports = {
    crearAnuncio,
    obtenerAnunciosPorProyecto,
    obtenerAnuncio,
    eliminarAnuncio
};