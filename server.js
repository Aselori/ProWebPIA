import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config/database.js'; // Asegúrate de que pool está exportado

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let usuario = {
  id: 0,
  nombre: "",
  role: 0
};

app.use(express.static(join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  res.render('index', { usuario: usuario });
});

app.get('/register', async (req, res) => {
  res.render('register');
});

app.get('/login', async (req, res) => {
  res.render('login');
});

app.get('/perfil-profesor', async (req, res) => {
  const query = req.query.q.toLowerCase();

  try {
    // Buscar al profesor en la base de datos por nombre completo
    const data = await pool.query(
      'SELECT id, first_name, last_name FROM professors WHERE LOWER(CONCAT(first_name, \' \', last_name)) = $1',
      [query]
    );

    if (data.rows.length > 0) {
      const profesor = data.rows[0];

      // Capitalizar cada palabra en el nombre y apellido
      const nombreCapitalizado = profesor.first_name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      const apellidoCapitalizado = profesor.last_name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Buscar las materias del profesor
      const materias = await pool.query(
        'SELECT subject_id FROM professor_subjects WHERE professor_id = $1',
        [profesor.id]
      );

      // Obtener las materias correspondientes
      const materiaIds = materias.rows.map(materia => materia.subject_id);
      const materiasInfo = await pool.query(
        'SELECT id, name FROM subjects WHERE id = ANY($1::int[])',
        [materiaIds]
      );

      // Transformar las materias en una lista de nombres
      const materiasLista = materiasInfo.rows.map(materia => materia.name);

      const profesor_info = {
        nombre: nombreCapitalizado,
        apellido: apellidoCapitalizado,
        id: profesor.id
      };

      const result = await pool.query('SELECT * FROM obtener_comentarios_de_profesor($1) ORDER BY likes DESC', [profesor_info.id]);

      const comentarios = result.rows;

      // Crear un arreglo para almacenar los comentarios del usuario
      let comentarios_profesor = comentarios.map(comentario => ({
        usuario: comentario.username,
        materia: comentario.subject_name,
        contenido: comentario.content,
        likes: comentario.likes,
        dislikes: comentario.dislikes
      }));

      // Renderizar la vista con la información del profesor y su lista de materias
      res.render('profesor_profile', { id: profesor.id, usuario: usuario, materias: materiasLista, profesor: profesor_info, usuario_id: usuario.id, comentarios: comentarios_profesor });
    } else {
      res.status(404).send('Profesor no encontrado');
    }
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/buscar', async (req, res) => {
  const query = req.query.q.toLowerCase();

  // Obtener los datos de la base de datos
  const data = await pool.query('SELECT first_name, last_name FROM professors');

  // Combinar nombre y apellido
  const profesores = data.rows.map(profesor => `${profesor.first_name} ${profesor.last_name}`);

  // Filtrar los resultados basados en la consulta
  const resultados = profesores.filter(profesor => profesor.toLowerCase().includes(query));

  // Enviar los resultados filtrados como JSON
  res.json(resultados);
});

app.post('/post_comentario', async (req, res) => {
  const { materia, comentario, profesorID } = req.body;

  // Validar que el comentario no esté vacío
  if (!comentario || !comentario.trim()) {
    return res.status(400).send('El contenido del comentario es requerido.');
  }

  try {
    // Obtener el id de la materia
    const idMateriaResult = await pool.query('SELECT id FROM subjects WHERE name = $1', [materia]);
    const idMateria = idMateriaResult.rows[0].id;

    // Insertar el comentario en la base de datos
    await pool.query(
      'INSERT INTO comments (user_id, professor_id, subject_id, content, is_enabled) VALUES ($1, $2, $3, $4, TRUE)',
      [usuario.id, profesorID, idMateria, comentario]
    );

    // Enviar una respuesta exitosa
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).send('Hubo un error al procesar la solicitud');
  }
});

app.get('/user_screen', async (req, res) => {
  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  if (usuario && usuario.nombre) {
    usuario.nombre = capitalizeFirstLetter(usuario.nombre);
  }

  // Consulta a la base de datos
  const result = await pool.query('SELECT * FROM obtener_comentarios_con_nombres($1)', [usuario.id]);

  const comentarios = result.rows;

  // Crear un arreglo para almacenar los comentarios del usuario
  let comentarios_usuario = comentarios.map(comentario => ({
    profesor: comentario.profesor_nombre_completo,
    materia: comentario.subject_name,
    contenido: comentario.content,
    likes: comentario.likes,
    dislikes: comentario.dislikes
  }));

  // Renderizar la vista con el usuario y los comentarios
  res.render('profile', { usuario, comentarios: comentarios_usuario });
});

app.post('/new', async (req, res) => {
  const { email, password, usuario: userName, 'confirm-password': confirmPassword } = req.body;

  try {
    const usuarioExists = await pool.query('SELECT 1 FROM users WHERE username = $1', [userName]);

    if (usuarioExists.rows.length > 0) {
      return res.redirect('/register?message=El nombre de usuario ya está registrado&messageType=error');
    }

    const emailExists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);

    if (emailExists.rows.length > 0) {
      return res.redirect('/register?message=El correo ya está registrado&messageType=error');
    }

    if (password !== confirmPassword) {
      return res.redirect('/register?message=Las contraseñas no coinciden&messageType=error');
    }

    await pool.query('INSERT INTO users (email, password, username) VALUES ($1, $2, $3)', [email, password, userName]);

    return res.redirect('/login?message=Se creó la cuenta con éxito');
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.status(500).send('Error al crear la cuenta');
  }
});

app.post('/login_val', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // Actualiza el objeto usuario con los datos del usuario encontrado
      usuario.id = user.id;
      usuario.nombre = user.username;
      usuario.role = user.role;

      // Renderiza la vista 'index' pasando el objeto usuario actualizado
      res.render('index', { usuario: usuario });
    } else {
      return res.redirect('/login?message=' + encodeURIComponent('No existen credenciales') + '&messageType=error');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
