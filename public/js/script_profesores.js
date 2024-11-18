document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
        alert(message); // Muestra el mensaje pasado en la URL
    }
    
    // Recuperar el ID del profesor y del usuario desde los campos ocultos en el HTML
    const profesorId = document.getElementById('profesor-id').value;
    const usuarioId = document.getElementById('usuario-id').value;

    // Campo de búsqueda
    const busquedaInput = document.getElementById('busqueda');
    const resultadosList = document.getElementById('resultados');

    busquedaInput.addEventListener('input', function() {
        const query = this.value;

        // Solo buscar si hay más de una letra
        if (query.length > 0) {
            fetch(`/buscar?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    resultadosList.innerHTML = ''; // Limpiar resultados anteriores

                    // Mostrar resultados
                    data.forEach(item => {
                        const li = document.createElement('li');
                        li.className = 'p-2 hover:bg-gray-200 cursor-pointer'; // Estilos para los resultados
                        li.textContent = item;

                        // Evento de clic en cada resultado
                        li.addEventListener('click', function() {
                            busquedaInput.value = item; // Rellenar el campo de búsqueda con el resultado seleccionado
                            resultadosList.innerHTML = ''; // Limpiar la lista de resultados después de seleccionar
                        });

                        resultadosList.appendChild(li);
                    });
                })
                .catch(error => console.error('Error en la búsqueda:', error));
        } else {
            resultadosList.innerHTML = ''; // Limpiar si no hay texto
        }
    });

    // Capturar el evento Enter en el campo de búsqueda
    busquedaInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evitar el comportamiento por defecto

            const query = this.value;

            // Redirigir al usuario a una nueva página con la búsqueda
            window.location.href = `/perfil-profesor?q=${encodeURIComponent(query)}`;
        }
    });

    const comentarioForm = document.getElementById('comentario-form');

    comentarioForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        // Obtener los valores del dropdown y del input de comentario
        const materiaSeleccionada = document.getElementById('materia-dropdown').value;
        const comentario = document.getElementById('comentario-input').value;

        // Validación: verificar que el comentario no esté vacío
        if (!comentario.trim()) {
            alert('Por favor, escribe un comentario.');
            return;
        }

        // Verificar si el usuario está logueado
        if (parseInt(usuarioId) <= 0) { // Comparar como número
            alert('Necesitas iniciar sesión');
            return;
        }

        // Enviar los datos al servidor usando fetch
        fetch('/post_comentario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                materia: materiaSeleccionada,
                comentario: comentario,
                profesorID: profesorId // Usa el ID del profesor desde el campo oculto
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar un mensaje de éxito o actualizar la página
                alert('Comentario enviado con éxito');
            } else {
                alert('Hubo un error al enviar el comentario');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

        // Limpiar el campo de comentario después de enviar
        document.getElementById('comentario-input').value = '';
    });
});
