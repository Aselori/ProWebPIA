import express from 'express';
import session from 'express-session';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from './config/database.js'; // Asegúrate de que 'pool' esté configurado correctamente

const app = express();
const port = 3000;

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware and configuration
app.use(express.static(join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: '123', // Cambia esto por una clave segura en producción
  resave: false,
  saveUninitialized: false,
}));

// Middleware para verificar si el usuario es administrador
function requireAdmin(req, res, next) {
  if (!req.session.usuario || req.session.usuario.role !== 1) {
    return res.redirect('/');
  }
  next();
}

// Función para obtener profesores con sus likes/dislikes
async function obtenerProfesores() {
  try {
    const data = await pool.query(`
      SELECT p.id, p.first_name, p.last_name, 
        (SELECT COUNT(pl.is_like) FROM professor_likes pl WHERE pl.professor_id = p.id AND pl.is_like = true) AS likes,
        (SELECT COUNT(pl.is_like) FROM professor_likes pl WHERE pl.professor_id = p.id AND pl.is_like = false) AS dislikes,
        ARRAY_AGG(DISTINCT s.name) AS materias
      FROM professors p
      LEFT JOIN professor_subjects ps ON p.id = ps.professor_id
      LEFT JOIN subjects s ON ps.subject_id = s.id
      GROUP BY p.id
    `);
    return data.rows.map(profesor => ({
      id: profesor.id,
      nombre: `${profesor.first_name} ${profesor.last_name}`,
      likes: profesor.likes || 0,
      dislikes: profesor.dislikes || 0,
      materias: profesor.materias ? profesor.materias.filter(m => m).join(', ') : ''
    }));
  } catch (error) {
    console.error('Error al obtener los profesores:', error);
    return [];
  }
}

async function obtenerDatosDashboard() {
  try {
    const [usuarios, maestros, materias, reportes, comentarios] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM users'), // Get total users
      pool.query('SELECT COUNT(*) AS total FROM professors'), // Get total professors (maestros)
      pool.query('SELECT COUNT(*) AS total FROM subjects'), // Get total subjects (materias)
      pool.query('SELECT COUNT(*) AS total FROM reports'), // Get total reports (assuming you have a table called 'reports')
      pool.query('SELECT COUNT(*) AS total FROM comments') // Get total comments
    ]);

    return {
      totalUsuarios: usuarios.rows[0].total || 0,
      totalMaestros: maestros.rows[0].total || 0,
      totalMaterias: materias.rows[0].total || 0,
      totalReportes: reportes.rows[0].total || 0,
      totalComentarios: comentarios.rows[0].total || 0
    };
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    return {
      totalUsuarios: 0,
      totalMaestros: 0,
      totalMaterias: 0,
      totalReportes: 0,
      totalComentarios: 0
    };
  }
}


// Ruta para la página de inicio
app.get('/', async (req, res) => {
  try {
    const profesores = await obtenerProfesores();
    const usuario = req.session.usuario || { id: 0, nombre: '', role: 0 }; // Usa la variable de sesión
    const usuarioLogueado = usuario && usuario.id > 0;
    res.render('index', { usuario, profesores, usuarioLogueado });
  } catch (error) {
    console.error('Error al renderizar la página principal:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/buscar', async (req, res) => {
  const query = req.query.q?.toLowerCase() || ''; // Lee el parámetro 'q' de la consulta

  if (query.length === 0) {
    return res.json([]); // Si no hay consulta, devuelve un array vacío
  }

  try {
    const result = await pool.query(`
      SELECT CONCAT(first_name, ' ', last_name) AS nombre
      FROM professors
      WHERE LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1
      LIMIT 10
    `, [`%${query}%`]); // Busca nombres que coincidan parcialmente

    const nombres = result.rows.map(row => row.nombre);
    res.json(nombres);
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/deleteCrud', async (req, res) => {
  const { id, tabla } = req.body;

  // Listado de tablas permitidas (para evitar SQL Injection)
  const tablasPermitidas = ['report_status', 'users', 'comments', 'professors'];

  try {
      // Construir la consulta de forma segura
      const query = `DELETE FROM ${tabla} WHERE id = $1 RETURNING *;`;

      const result = await pool.query(query, [id]);

      if (result.rowCount > 0) {
          res.json({ success: true, message: "Registro eliminado correctamente", deleted: result.rows });
      } else {
          res.status(404).json({ success: false, message: "No se encontró el ID" });
      }
  } catch (error) {
      console.error("Error al eliminar:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

app.post('/updateStatus', async (req, res) => {
  const { id } = req.body;

  try {
      const result = await pool.query(
          'UPDATE reports SET status_id = $1 WHERE id = $2;',
          [1, id]
      );

      // Verificar si se actualizó algún registro
      if (result.rowCount > 0) {
          res.json({ success: true, message: "Estado actualizado correctamente" });
      } else {
          res.status(404).json({ success: false, message: "No se encontró el ID" });
      }
  } catch (error) {
      console.error("Error al actualizar el estado:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// Ruta para la página de login
app.get('/login', (req, res) => res.render('login'));
// Ruta para la página de register
app.get('/register', (req, res) => {res.render('register'); });

//ruta para agregar nuevo usuario

app.post('/newReport', async (req,res)=> {
  const {user_id,comment_id,reason} = req.body 
  try { 
    // Llamar a la función insert_report en PostgreSQL
    const result = await pool.query(
        'SELECT insert_report($1, $2, $3)',
        [user_id, comment_id, reason]
    );

    res.json({ success: true, message: "Reporte creado con éxito" });

} catch (error) {
    console.error("Error al insertar el reporte:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
}
})


app.post('/new', async (req, res) => {
  const { email, password, username, 'confirm-password': confirmPassword } = req.body;

  try {
    // Verificar si el nombre de usuario ya existe
    const userExists = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);

    if (userExists.rows.length > 0) {
      return res.redirect('/register?message=El nombre de usuario ya está registrado&messageType=error');
    }

    // Verificar si el correo ya está registrado
    const emailExists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);

    if (emailExists.rows.length > 0) {
      return res.redirect('/register?message=El correo ya está registrado&messageType=error');
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.redirect('/register?message=Las contraseñas no coinciden&messageType=error');
    }


    console.log("Insertando usuario con:", username, email, password); // Verificar antes de la inserción

    // Insertar el nuevo usuario en la base de datos con role_id = 1
    await pool.query(
      'INSERT INTO users (username,email,password,role_id) VALUES ($1, $2, $3, $4)',
      [username,email,password,2]
    );

    return res.redirect('/login?message=Se creó la cuenta con éxito');
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.status(500).send('Error al crear la cuenta');
  }
});


// Validación de inicio de sesión
app.post('/login_val', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id::integer AS id, username, role_id::integer AS role_id FROM users WHERE email = $1 AND password = $2', 
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Asegurar que id y role sean enteros
      req.session.usuario = { 
        id: user.id, 
        nombre: user.username, 
        role: user.role_id 
      };

      console.log('Usuario después del login:', req.session.usuario);
      res.redirect('/');
    } else {
      res.redirect('/login?message=' + encodeURIComponent('No existen credenciales') + '&messageType=error');
    }
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).send('Error en el servidor');
  }
});


// Ruta de perfil del usuario
app.get('/profile', async (req, res) => {
  const usuario = req.session.usuario || { id: 0, nombre: '', role: 0 };
  if (usuario.id === 0) {
    return res.redirect('/login');
  }

  try {
    const result = await pool.query('SELECT * FROM obtener_comentarios_de_usuario($1)', [usuario.id]);
    const comentarios = result.rows.map(comentario => ({
      profesor: comentario.profesor_nombre_completo,
      materia: comentario.materia_nombre,
      contenido: comentario.contenido,
      likes: comentario.likes,
      dislikes: comentario.dislikes,
    }));

    res.render('profile', { usuario, comentarios });
  } catch (error) {
    console.error('Error al renderizar la pantalla del perfil del usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta de logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.redirect('/');
    }
    res.redirect('/login');
  });
});

// Ruta de dashboard para administradores
app.get('/dashboard', async (req, res) => {
  if (!req.session.usuario || req.session.usuario.role !== 1) { // Ensure only admins can access
    return res.redirect('/');
  }

  try {
    const datosDashboard = await obtenerDatosDashboard();
    res.render('dashboard', { usuario: req.session.usuario, datosDashboard });
  } catch (error) {
    console.error('Error al renderizar el dashboard:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/dashboard/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const validTables = [
    'users', 'professors', 'subjects', 'comments', 
    'reports', 'report_reasons', 'roles', 
    'professor_likes', 'comment_likes', 'professor_subjects'
  ];

  if (!validTables.includes(tableName)) {
    return res.status(404).send('Tabla no encontrada');
  }

  try {
    const data = await pool.query(`SELECT * FROM ${tableName}`);
    res.render('crud_table', { tableName, data: data.rows });
  } catch (error) {
    console.error(`Error al obtener los datos de la tabla ${tableName}:`, error);
    res.status(500).send('Error al obtener los datos');
  }
});


app.post('/dashboard/:tableName/add', async (req, res) => {
  const { tableName } = req.params;
  const validTables = ['users', 'professors', 'subjects', 'comments', 'reports', 'report_reasons', 'roles', 'professor_likes', 'comment_likes', 'professor_subjects'];
  if (!validTables.includes(tableName)) {
    return res.status(404).send('Tabla no encontrada');
  }

  // Aquí puedes agregar lógica para manejar la inserción de datos.
  // Necesitarás adaptar esto según los campos específicos de cada tabla.
  res.send(`Agregar un nuevo registro a la tabla ${tableName}`);
});


// Ruta para manejar la funcionalidad de like/dislike
app.post('/like-dislike', async (req, res) => {
  const { profesorId, isLike } = req.body;

  if (!req.session.usuario || req.session.usuario.id === 0) {
    return res.json({ success: false, message: 'Debes iniciar sesión para realizar esta acción.' });
  }

  try {
    await pool.query(`
      INSERT INTO professor_likes (user_id, professor_id, is_like)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, professor_id) 
      DO UPDATE SET is_like = $3;
    `, [req.session.usuario.id, profesorId, isLike]);

    const likeResult = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_like = true) AS likes,
        COUNT(*) FILTER (WHERE is_like = false) AS dislikes
      FROM professor_likes
      WHERE professor_id = $1;
    `, [profesorId]);

    const newLikes = likeResult.rows[0].likes || 0;
    const newDislikes = likeResult.rows[0].dislikes || 0;

    res.json({ success: true, newLikes, newDislikes });
  } catch (error) {
    console.error('Error al manejar la acción de like/dislike:', error);
    res.json({ success: false, message: 'Error al manejar la acción.' });
  }
});

app.post('/like-dislike-comment', async (req, res) => {
  const { commentId, isLike } = req.body;

  // Verificar si el usuario está autenticado
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ success: false, message: 'Debes iniciar sesión para realizar esta acción.' });
  }

  try {
    // Insertar o actualizar el like/dislike en comment_likes
    await pool.query(`
      INSERT INTO comment_likes (user_id, comment_id, is_like)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, comment_id) 
      DO UPDATE SET is_like = $3;
    `, [req.session.usuario.id, commentId, isLike]);

    // Obtener la cantidad de likes y dislikes después de la actualización
    const likeResult = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_like = true) AS likes,
        COUNT(*) FILTER (WHERE is_like = false) AS dislikes
      FROM comment_likes
      WHERE comment_id = $1;
    `, [commentId]);

    // Obtener los valores de la consulta (si no existen, devolver 0)
    const newLikes = likeResult.rows[0].likes || 0;
    const newDislikes = likeResult.rows[0].dislikes || 0;

    res.json({ success: true, newLikes, newDislikes });
  } catch (error) {
    console.error('Error al manejar la acción de like/dislike en comentario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Ruta para mostrar el perfil de un profesor
app.get('/perfil-profesor', async (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.status(400).send('Consulta inválida');
  }

  try {
    const data = await pool.query(
      'SELECT id, first_name, last_name FROM professors WHERE LOWER(CONCAT(first_name, \' \', last_name)) = $1',
      [query]
    );

    if (data.rows.length === 0) {
      return res.status(404).send('Profesor no encontrado');
    }

    const profesor = data.rows[0];

    const likesData = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_like = true) AS likes,
        COUNT(*) FILTER (WHERE is_like = false) AS dislikes
      FROM professor_likes
      WHERE professor_id = $1;
    `, [profesor.id]);

    const likes = likesData.rows[0].likes || 0;
    const dislikes = likesData.rows[0].dislikes || 0;

    const materias = await pool.query(
      'SELECT subject_id FROM professor_subjects WHERE professor_id = $1',
      [profesor.id]
    );
    const materiaIds = materias.rows.map(materia => materia.subject_id);
    const materiasInfo = await pool.query(
      'SELECT id, name FROM subjects WHERE id = ANY($1::int[])',
      [materiaIds]
    );
    const materiasLista = materiasInfo.rows.map(materia => materia.name);

    const profesor_info = { 
      nombre: profesor.first_name, 
      apellido: profesor.last_name, 
      id: profesor.id 
    };

    const comentariosData = await pool.query('SELECT * FROM obtener_comentarios_de_profesor($1) ORDER BY likes DESC', [profesor.id]);
    const comentarios_profesor = comentariosData.rows.map(comentario => ({
      usuario: comentario.username,
      materia: comentario.subject_nombre,
      contenido: comentario.contenido,
      likes: comentario.likes,
      dislikes: comentario.dislikes
    }));

    res.render('profesor_profile', { 
      id: profesor.id, 
      usuario: req.session.usuario, 
      materias: materiasLista, 
      profesor: profesor_info, 
      usuario_id: req.session.usuario?.id || 0, 
      comentarios: comentarios_profesor,
      likes,
      dislikes
    });
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para agregar un nuevo maestro
app.get('/agregar-maestro', (req, res) => {

  console.log(req.session.usuario);
  // Asegúrate de que el usuario esté autenticado y autorizado (opcional)
  if (!req.session.usuario || req.session.usuario.role !== 1) {
    return res.redirect('/');
  }
  res.render('agregar_maestro', { usuario: req.session.usuario });
});

app.post('/agregar-maestro', async (req, res) => {
  const { nombre, apellidos } = req.body;

  if (!nombre || !apellidos) {
    return res.redirect('/agregar-maestro?message=' + encodeURIComponent('Todos los campos son obligatorios') + '&messageType=error');
  }

  try {
    // Inserta el nuevo maestro en la base de datos
    await pool.query(
      `INSERT INTO professors (first_name, last_name, created_at) VALUES ($1, $2, NOW())`,
      [nombre, apellidos]
    );

    res.redirect('/?message=' + encodeURIComponent('Maestro agregado con éxito') + '&messageType=success');
  } catch (error) {
    console.error('Error al agregar el maestro:', error);
    res.redirect('/agregar-maestro?message=' + encodeURIComponent('Hubo un error al agregar el maestro') + '&messageType=error');
  }
});

app.get('/nosotros', (req, res) => {
  res.render('nosotros', { usuario: req.session.usuario || null });
});

// Ruta para la página "FAQ"
app.get('/faq', (req, res) => {
  res.render('faq', { usuario: req.session.usuario || null });
});


// Ruta para manejar la publicación de comentarios
app.post('/post_comentario', async (req, res) => {
  const { profesorId, usuarioId, materia, comentario } = req.body;

  if (!req.session.usuario || req.session.usuario.id === 0) {
    return res.json({ success: false, message: 'Debes iniciar sesión para enviar un comentario.' });
  }

  if (!profesorId || !usuarioId || !materia || !comentario) {
    return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  try {
    await pool.query(
      `INSERT INTO comments (user_id, professor_id, subject_id, content, created_at, is_enabled)
       VALUES ($1, $2, (SELECT id FROM subjects WHERE name = $3 LIMIT 1), $4, NOW(), true)`,
      [usuarioId, profesorId, materia, comentario]
    );
    res.json({ success: true, message: 'Comentario enviado con éxito.' });
  } catch (error) {
    console.error('Error al insertar el comentario:', error);
    res.json({ success: false, message: 'Error al enviar el comentario.' });
  }
});

app.get('/header', (req, res) => {
  res.render('header', { usuario: req.session.usuario || null });
});



// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
