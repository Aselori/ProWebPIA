import pkg from 'pg';  
const { Pool } = pkg;  

// Crear una instancia de Pool
// Cambiar credenciales en cada equipo LOCAL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'FimeCoach',
    password: '123',
    port: 5433,
});


pool.on('connect', () => {
    console.log('Conectado a la base de datos PostgreSQL');
});


export { pool };


export function query(text, params) {
    return pool.query(text, params);
}
