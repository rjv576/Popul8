const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const faker = require('faker'); // Importar faker
const format  = require('pg-format');
const app = express();
const port = 3000;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'mi_usuario',
    host: 'localhost',
    database: 'popul8',
    password: '0620',
    port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta para manejar el formulario
app.post('/create-users', async (req, res) => {
    const { radio,fname, lname, username, email,sex,birthday, password, quantity } = req.body;

    if (radio === '1') {
        // Crear un solo usuario
        try {
            const result = await pool.query(
                'INSERT INTO users (fname, lname, username, email, sex, birthday, password) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [fname,lname,username, email, sex, birthday, password]
            );
            res.send('Usuario creado exitosamente');
        } catch (err) {
            console.error(err);
            res.send('Error al crear el usuario');
        }
    } else if (radio === '2') {
        // Crear usuarios masivamente
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('ALTER TABLE users DISABLE TRIGGER ALL'); // Deshabilitar índices temporalmente

            const users = [];
            for (let i = 0; i < quantity; i++) {
                users.push([
                    faker.name.firstName().substring(0, 50), // Limitar a 50 caracteres
                    faker.name.lastName().substring(0, 50), // Limitar a 50 caracteres
                    faker.internet.userName().substring(0, 50), // Limitar a 50 caracteres
                    faker.internet.email().substring(0, 100), // Limitar a 100 caracteres
                    faker.name.gender().substring(0, 10), // Limitar a 10 caracteres
                    faker.date.past(30, new Date()).toISOString().split('T')[0], // Fecha de nacimiento aleatoria
                    faker.internet.password().substring(0, 50) // Limitar a 50 caracteres
                ]);
            }
            const query = format('INSERT INTO users (fname, lname, username, email, sex, birthday, password) VALUES %L', users);
            await client.query(query);

            await client.query('ALTER TABLE users ENABLE TRIGGER ALL'); // Habilitar índices nuevamente
            await client.query('COMMIT');
            res.send('Usuarios creados exitosamente');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.send('Error al crear los usuarios');
        } finally {
            client.release();
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});