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

app.post('/nueva-solicitud-maestro', async (req, res) => {
  if (!req.session.usuario || req.session.usuario.id === 0) {
      return res.status(401).json({ success: false, message: 'Debes iniciar sesión para enviar una solicitud.' });
  }

  const { first_name, last_name } = req.body;
  const user_id = req.session.usuario.id;

  try {
      // Contar cuántas solicitudes ha hecho el usuario hoy
      const { rows } = await pool.query(
          `SELECT COUNT(*) AS total FROM professors_requests 
          WHERE user_id = $1 AND created_at::DATE = CURRENT_DATE`,
          [user_id]
      );

      if (parseInt(rows[0].total, 10) >= 5) {
          return res.status(400).json({ success: false, message: 'Has alcanzado el límite de 5 solicitudes por día.' });
      }

      // Insertar la nueva solicitud si aún no ha alcanzado el límite
      await pool.query(
          `INSERT INTO professors_requests (first_name, last_name, user_id, status_id, created_at) 
          VALUES ($1, $2, $3, 1, NOW())`, // Se asegura de que la solicitud tenga estado "pending" y la fecha actual
          [first_name, last_name, user_id]
      );

      res.json({ success: true, message: 'Solicitud enviada correctamente.' });

  } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});



// RUTA PARA QUE ADMINISTRADORES VEAN SOLICITUDES
app.get('/solicitudes-maestro', async (req, res) => {
  if (!req.session.usuario || req.session.usuario.role !== 1) {
      return res.status(403).json({ success: false, message: 'No autorizado.' });
  }

  try {
      const solicitudes = await pool.query(`SELECT * FROM professors_requests WHERE status_id = 1`);
      res.json({ success: true, solicitudes: solicitudes.rows });
  } catch (error) {
      console.error('Error al obtener las solicitudes:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// RUTA PARA QUE ADMINISTRADORES APRUEBEN O RECHACEN SOLICITUDES
app.post('/gestionar-solicitud-maestro', async (req, res) => {
  if (!req.session.usuario || req.session.usuario.role !== 1) {
      return res.status(403).json({ success: false, message: 'No autorizado.' });
  }

  const { id, action } = req.body;

  try {
      const solicitud = await pool.query(`SELECT * FROM professors_requests WHERE id = $1`, [id]);

      if (solicitud.rowCount === 0) {
          return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
      }

      if (action === 'approve') {
          console.log(`✅ Aprobando solicitud ID: ${id}`);
          await pool.query(
              `INSERT INTO professors (first_name, last_name, created_at) VALUES ($1, $2, NOW())`,
              [solicitud.rows[0].first_name, solicitud.rows[0].last_name]
          );
          await pool.query(`UPDATE professors_requests SET status_id = 2 WHERE id = $1`, [id]); // 2 = approved
      } else if (action === 'reject') {
          console.log(`❌ Rechazando solicitud ID: ${id}`);
          await pool.query(`UPDATE professors_requests SET status_id = 3 WHERE id = $1`, [id]); // 3 = rejected
      }

      res.json({ success: true, message: 'Solicitud procesada correctamente.' });
  } catch (error) {
      console.error('⚠️ Error al gestionar la solicitud:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});





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
      pool.query('SELECT COUNT(*) AS total FROM users'),
      pool.query('SELECT COUNT(*) AS total FROM professors'), 
      pool.query('SELECT COUNT(*) AS total FROM subjects'),
      pool.query('SELECT COUNT(*) AS total FROM reports'), 
      pool.query('SELECT COUNT(*) AS total FROM comments') 
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

    // Definir las tablas permitidas y sus claves primarias
    const tablasPermitidas = {
        'users': 'id',
        'professor_subjects': 'id',
        'comments': 'id',
        'professors': 'id',
        'reports': 'id',
        'report_status': 'id',
        'report_reasons': 'id',
        'subjects': 'id',
        'professors_requests': 'id'
    };

    // Validar que la tabla esté permitida
    if (!tablasPermitidas[tabla]) {
        return res.status(400).json({ success: false, message: "Tabla no permitida" });
    }

    try {
        // Obtener la clave primaria correcta de la tabla
        const primaryKey = tablasPermitidas[tabla];

        const query = `DELETE FROM ${tabla} WHERE ${primaryKey} = $1 RETURNING *;`;
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


app.post('/cambiarNombre', async (req, res) => {
  if (!req.session || !req.session.usuario) {
      return res.status(401).json({ message: "No autorizado" });
  }

  const userId = req.session.usuario.id;
  const { newName } = req.body;

  if (!newName || newName.trim() === "") {
      return res.status(400).json({ message: "El nuevo nombre es requerido." });
  }

  try {
      // Verificar si el nuevo nombre ya existe en la base de datos
      const checkUser = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [newName, userId]
      );

      if (checkUser.rowCount > 0) {
          return res.status(409).json({ message: "El nombre de usuario ya está en uso." });
      }

      // Si no existe, proceder con la actualización
      const result = await pool.query(
          'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
          [newName, userId]
      );

      if (result.rowCount === 0) {
          return res.status(404).json({ message: "Usuario no encontrado." });
      }

      // ✅ FORZAR ACTUALIZACIÓN DE LA SESIÓN
      req.session.usuario.username = newName;
      req.session.save(err => {
          if (err) {
              console.error("Error al guardar la sesión:", err);
              return res.status(500).json({ message: "Error en la sesión." });
          }
          res.json({ 
            message: "Nombre de usuario actualizado con éxito.\nVuelve a iniciar sesión para ver el cambio.", 
            user: result.rows[0] 
        });
      });

  } catch (error) {
      console.error("Error al cambiar el nombre en la base de datos:", error);
      res.status(500).json({ message: "Error interno del servidor." });
  }
});



app.get('/profileData', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ message: "No autorizado" });
    }
    res.json({ username: req.session.usuario.username });
});

app.post('/newReport', async (req, res) => {
  if (!req.session.usuario || req.session.usuario.id === 0) {
      return res.json({ success: false, message: "Debes iniciar sesión para enviar un reporte." });
  }

  const { comment_id, reason } = req.body;
  const user_id = req.session.usuario.id;

  try {
      // Buscar el ID de status correspondiente a "pending"
      const statusResult = await pool.query(
          'SELECT id FROM report_status WHERE status_name = $1 LIMIT 1',
          ['pending']
      );

      if (statusResult.rows.length === 0) {
          return res.status(500).json({ success: false, message: "Error: No se encontró el estado 'pending' en report_status." });
      }

      const status_id = statusResult.rows[0].id; // Obtener el ID real de "pending"

      await pool.query(
          'INSERT INTO reports (user_id, comment_id, reason_id, status_id, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [user_id, comment_id, reason, status_id]
      );

      res.json({ success: true, message: "Reporte enviado con éxito." });
  } catch (error) {
      console.error("Error al insertar el reporte:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});




app.post('/borrarComentario', async (req, res) => {
  const { commentID } = req.body;

  // Validación básica
  if (!commentID) {
    return res.status(400).json({ message: "El ID del comentario es requerido" });
  }

  try {
    // Eliminar los "likes" asociados al comentario
    const likesDeleteResult = await pool.query(
      'DELETE FROM comment_likes WHERE comment_id = $1',
      [commentID]
    );

    // Eliminar el comentario
    const commentDeleteResult = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING *',
      [commentID]
    );

    // Si no se eliminó ningún comentario, significa que no existe
    if (commentDeleteResult.rowCount === 0) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    res.json({ message: "Comentario eliminado correctamente", deletedComment: commentDeleteResult.rows[0] });

  } catch (error) {
    console.error("Error al borrar comentario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


app.post('/updateStatus', async (req, res) => {
  const { id, newStatus } = req.body;

  try {
      const result = await pool.query(
          'UPDATE reports SET status_id = $1 WHERE id = $2;',
          [newStatus, id]
      );

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
  if (!req.session.usuario || req.session.usuario.id === 0) {
    return res.redirect('/login');
  }

  try {
    const usuario_id = req.session.usuario.id; // 💡 Definir correctamente usuario_id

    // Obtener los comentarios del usuario
    const result = await pool.query('SELECT * FROM obtener_comentarios_de_usuario($1)', [usuario_id]);
    const comentarios = result.rows.map(comentario => ({
      id: comentario.comment_id, 
      profesor: comentario.profesor_nombre,
      materia: comentario.subject_nombre,
      contenido: comentario.contenido,
      likes: comentario.likes,
      dislikes: comentario.dislikes,
    }));

    // Obtener razones de reporte
    const reasonsResult = await pool.query('SELECT id, reason_name FROM report_reasons');
    const report_reasons = reasonsResult.rows;

    res.render('profile', { 
      usuario: req.session.usuario, 
      usuario_id, // 👈 Ahora se pasa correctamente
      comentarios, 
      report_reasons 
    });

  } catch (error) {
    console.error('❌ Error al renderizar profile.ejs:', error);
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



app.get('/dashboard', async (req, res) => {
  if (!req.session.usuario || req.session.usuario.role !== 1) {
    return res.redirect('/');
  }

  try {
    // Obtener lista de tablas de la base de datos con ORDER BY
    const result = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename ASC");
    const tables = result.rows.map(row => row.tablename);

    const datosDashboard = await obtenerDatosDashboard();
    res.render('dashboard', { usuario: req.session.usuario, datosDashboard, tables });
  } catch (error) {
    console.error("Error obteniendo datos del dashboard o tablas:", error);
    res.status(500).send("Error en el servidor");
  }
});

app.get('/dashboard/:tableName', async (req, res) => {
  if (!req.session.usuario || req.session.usuario.role !== 1) {
      return res.redirect('/');
  }

  const { tableName } = req.params;

  try {
      // Obtener todas las tablas disponibles en la base de datos
      const resultTables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename ASC");
      const tables = resultTables.rows.map(row => row.tablename);

      // Verificar si la tabla solicitada existe en la base de datos
      if (!tables.includes(tableName)) {
          return res.status(404).send("Tabla no encontrada");
      }

      // Obtener la primera columna de la tabla para ordenar
      const columnResult = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position ASC 
          LIMIT 1;
      `, [tableName]);

      if (columnResult.rowCount === 0) {
          return res.status(404).send("No se encontraron columnas en la tabla");
      }

      const firstColumn = columnResult.rows[0].column_name;

      // Obtener los datos de la tabla ordenados por la primera columna
      const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY ${firstColumn} ASC`);
      const data = result.rows;

      res.render('crud_table', { usuario: req.session.usuario, tableName, tables, data });
  } catch (error) {
      console.error(`Error obteniendo datos de ${tableName}:`, error);
      res.status(500).send("Error en el servidor");
  }
});

app.post('/dashboard/update', async (req, res) => {
  let { tableName, id, ...data } = req.body;

  // Convertir `id` a número
  id = parseInt(id, 10);
  if (!tableName || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Parámetros inválidos: tableName o ID incorrecto." });
  }

  // Validar si la tabla permite edición
  const tablasEditables = ["users", "professors", "subjects", "comments", "report_reasons"];
  if (!tablasEditables.includes(tableName)) {
      return res.status(400).json({ success: false, message: "No permitido modificar esta tabla." });
  }

  // Construcción dinámica de la consulta evitando el ID
  const fields = Object.keys(data)
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(", ");
  
  const values = Object.values(data);

  try {
      await pool.query(`UPDATE ${tableName} SET ${fields} WHERE id = $${values.length + 1}`, [...values, id]);
      res.json({ success: true, message: "Registro actualizado correctamente." });
  } catch (error) {
      console.error("Error al actualizar:", error);
      res.status(500).json({ success: false, error });
  }
});





app.get('/users-by-date', async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date, COUNT(*)::integer AS count
          FROM users
          GROUP BY date
          ORDER BY date ASC;
      `);
      res.json(result.rows);
  } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Server error" });
  }
});

app.post('/dashboard/:tableName/add', async (req, res) => {
  const { tableName } = req.params;
  const data = req.body;

  const tableColumns = {
      users: ["username", "email", "password", "role_id"],
      professors: ["first_name", "last_name"],
      subjects: ["name"],
      comments: ["user_id", "professor_id", "content"],
      reports: ["user_id", "comment_id", "reason"],
      report_reasons: ["reason_name"],
      roles: ["name"],
      professor_likes: ["professor_id", "user_id", "is_like"],
      comment_likes: ["comment_id", "user_id", "is_like"],
      professor_subjects: ["professor_id", "subject_id"]
  };

  if (!tableColumns[tableName]) return res.redirect(`/dashboard/${tableName}?message=Tabla no permitida`);

  try {
      const columns = tableColumns[tableName];
      const values = columns.map(col => data[col]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      await pool.query(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *;`, values);
      res.redirect(`/dashboard/${tableName}?message=Registro agregado correctamente`);
  } catch (error) {
      console.error(`Error al insertar en ${tableName}:`, error);
      res.redirect(`/dashboard/${tableName}?message=Error al agregar registro`);
  }
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

  if (!commentId || isNaN(commentId)) {
      return res.status(400).json({ success: false, message: '❌ ID de comentario inválido' });
  }

  if (!req.session || !req.session.usuario) {
      return res.status(401).json({ success: false, message: '❌ Debes iniciar sesión para realizar esta acción.' });
  }

  console.log("📌 Recibido en /like-dislike-comment:", commentId, isLike);

  try {
      await pool.query(`
          INSERT INTO comment_likes (user_id, comment_id, is_like)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, comment_id) 
          DO UPDATE SET is_like = $3;
      `, [req.session.usuario.id, parseInt(commentId, 10), isLike]);

      const likeResult = await pool.query(`
          SELECT 
              COUNT(*) FILTER (WHERE is_like = true) AS likes,
              COUNT(*) FILTER (WHERE is_like = false) AS dislikes
          FROM comment_likes
          WHERE comment_id = $1;
      `, [parseInt(commentId, 10)]);

      res.json({ success: true, newLikes: likeResult.rows[0].likes || 0, newDislikes: likeResult.rows[0].dislikes || 0 });
  } catch (error) {
      console.error("❌ Error en /like-dislike-comment:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
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

    // Consulta para obtener las razones de reporte
    const reasonsResult = await pool.query('SELECT id, reason_name FROM report_reasons');
    const report_reasons = reasonsResult.rows; // Agregamos la lista de razones de reporte

    const comentariosData = await pool.query(
      'SELECT * FROM obtener_comentarios_de_profesor($1) ORDER BY likes DESC', 
      [profesor.id]
    );
    
    const comentarios_profesor = comentariosData.rows.map(comentario => ({
      id: comentario.id,
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
      dislikes,
      report_reasons // 🚀 Se envía la variable a la vista
    });

  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).send('Error interno del servidor');
  }
});


// Ruta para agregar un nuevo maestro
app.get('/agregar-maestro', (req, res) => {
  try {
      const usuario = req.session.usuario || { id: 0, nombre: '', role: 0 };
      res.render('agregar_maestro', { usuario });
  } catch (error) {
      console.error("Error al cargar la vista:", error);
      res.status(500).send("Error interno del servidor");
  }
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
  res.render('FAQ', { usuario: req.session.usuario || null });
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
