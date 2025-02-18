document.addEventListener('DOMContentLoaded', function () {
    // Recuperar el ID del profesor y del usuario desde los campos ocultos en el HTML
    const profesorId = document.getElementById('profesor-id')?.value;
    const usuarioId = document.getElementById('usuario-id')?.value;

    // Verificar que el usuario está logueado antes de manejar likes y dislikes
    if (!usuarioId || usuarioId <= 0) {
        console.warn('El usuario no está logueado. Los likes/dislikes no serán procesados.');
        return;
    }

    // Botones de "like" y "dislike"
    const likeButton = document.getElementById('like-button');
    const dislikeButton = document.getElementById('dislike-button');
    const likeCountSpan = document.getElementById('likes');
    const dislikeCountSpan = document.getElementById('dislikes');

    // Manejo de "likes"
    if (likeButton) {
        likeButton.addEventListener('click', function (event) {
            event.preventDefault();
            handleLikeDislike(profesorId, true); // true para "like"
        });
    }

    // Manejo de "dislikes"
    if (dislikeButton) {
        dislikeButton.addEventListener('click', function (event) {
            event.preventDefault();
            handleLikeDislike(profesorId, false); // false para "dislike"
        });
    }

    function handleLikeDislike(profesorId, isLike) {
        fetch(`/like-dislike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profesorId, isLike })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del servidor:', data);
            if (data.success) {
                // Actualiza los contadores de "likes" y "dislikes"
                if (likeCountSpan && dislikeCountSpan) {
                    likeCountSpan.textContent = data.newLikes;
                    dislikeCountSpan.textContent = data.newDislikes;
                } else {
                    console.error('No se encontraron los elementos para mostrar "likes" o "dislikes".');
                }
            } else {
                alert('Hubo un problema al registrar tu acción.');
            }
        })
        .catch(error => console.error('Error al procesar la acción:', error));
    }

    // Manejo del formulario de comentarios
    const comentarioForm = document.getElementById('comentario-form');
    if (comentarioForm) {
        comentarioForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const materiaSeleccionada = document.getElementById('materia-select').value;
            const comentario = document.getElementById('comment').value.trim();

            if (!comentario) {
                alert('Por favor, escribe un comentario antes de enviar.');
                return;
            }

            // Enviar el comentario al servidor
            fetch('/post_comentario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profesorId,
                    usuarioId,
                    materia: materiaSeleccionada,
                    comentario
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Comentario enviado con éxito.');
                    location.reload();
                } else {
                    alert('Hubo un problema al enviar el comentario.');
                }
            })
            .catch(error => console.error('Error al enviar el comentario:', error));
        });
    }
})




