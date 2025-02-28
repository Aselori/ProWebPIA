console.log("✅ scripts.js ha sido cargado en profile.ejs");

document.addEventListener('DOMContentLoaded', function() { 

    
    // Campo de búsqueda
    const busquedaInput = document.getElementById('busqueda');
    const resultadosList = document.getElementById('resultados');

    if (busquedaInput) {
        busquedaInput.addEventListener('input', function() {
            const query = this.value;
            if (query.length > 0) {
                fetch(`/buscar?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    resultadosList.innerHTML = ''; // Clear previous results
                    data.forEach(item => {
                        const li = document.createElement('li');
                        li.className = 'p-2 hover:bg-gray-200 cursor-pointer'; // Styling for results
                        li.textContent = item;
                        li.addEventListener('click', function() {
                            window.location.href = `/perfil-profesor?q=${encodeURIComponent(item)}`; // Navigate to profile
                        });
                        resultadosList.appendChild(li);
                    });
                })
                .catch(error => console.error('Error en la búsqueda:', error));
            } else {
                resultadosList.innerHTML = ''; // Clear if no input
            }
        });

        // Capturar el evento Enter en el campo de búsqueda
        busquedaInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default behavior
                const query = this.value;
                window.location.href = `/perfil-profesor?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // Manejo de "likes" y "dislikes"
    const likeButtons = document.querySelectorAll('.like-button');
    const dislikeButtons = document.querySelectorAll('.dislike-button');

    likeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const profesorId = this.dataset.profesorId;
            handleLikeDislike(profesorId, true, this); // true para "like"
        });
    });

    dislikeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const profesorId = this.dataset.profesorId;
            handleLikeDislike(profesorId, false, this); // false para "dislike"
        });
    });

    function handleLikeDislike(profesorId, isLike, button) {
        fetch(`/like-dislike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profesorId, isLike })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos del servidor:', JSON.stringify(data, null, 2)); // Verifica la respuesta
    
            if (data.success) {
                // Encuentra los contadores usando `data-profesor-id`
                const likeCountSpan = document.querySelector(`.like-count[data-profesor-id="${profesorId}"]`);
                const dislikeCountSpan = document.querySelector(`.dislike-count[data-profesor-id="${profesorId}"]`);
                
                // Verificación adicional
                if (!likeCountSpan) {
                    console.error(`No se encontró el contador de "likes" para el profesor con ID ${profesorId}.`);
                }
                if (!dislikeCountSpan) {
                    console.error(`No se encontró el contador de "dislikes" para el profesor con ID ${profesorId}.`);
                }
    
                if (likeCountSpan && dislikeCountSpan) {
                    // Actualiza los contadores
                    likeCountSpan.textContent = data.newLikes;
                    dislikeCountSpan.textContent = data.newDislikes;
                } else {
                    console.error('No se encontraron los contadores de "likes" o "dislikes" en el DOM.');
                }
    
                // Cambia el estado de los botones en el DOM
                if (isLike) {
                    const correspondingDislikeButton = button.closest('.flex').querySelector('.dislike-button');
                    if (correspondingDislikeButton) {
                        correspondingDislikeButton.classList.remove('active');
                    }
                    button.classList.add('active');
                } else {
                    const correspondingLikeButton = button.closest('.flex').querySelector('.like-button');
                    if (correspondingLikeButton) {
                        correspondingLikeButton.classList.remove('active');
                    }
                    button.classList.add('active');
                }
            } else {
                alert('Necesitas iniciar sesión.');
            }
        })
        .catch(error => console.error('Error al procesar la acción:', error));
    }

    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const selectedOption = document.getElementById('selectedOption');
    const profesorContainer = document.querySelector('.grid'); // Container for profesor cards

    // Toggle dropdown visibility
    dropdownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    // Handle option selection
    dropdownMenu.addEventListener('click', (event) => {
        const selectedValue = event.target.getAttribute('data-value');
        if (selectedValue) {
            selectedOption.textContent = selectedValue;
            sortProfesores(selectedValue);
        }
        dropdownMenu.classList.add('hidden'); // Hide menu after selection
    });

    // Sort profesores based on the selected option
    function sortProfesores(order) {
        const profesorCards = Array.from(profesorContainer.getElementsByClassName('profesor-card'));

        profesorCards.sort((a, b) => {
            const diffA = parseInt(a.getAttribute('data-diff'), 10);
            const diffB = parseInt(b.getAttribute('data-diff'), 10);

            // Invert the sorting logic
            return order === 'Rating Asc' ? diffA - diffB : diffB - diffA;
        });

        // Reorder elements in the container
        profesorCards.forEach(card => profesorContainer.appendChild(card));
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Initial sort by default
    sortProfesores('Rating Desc');
});

let id = "<%= usuario.id %>";  // Esto inyectará el valor del id en el script

        
const loginLink = document.getElementById('login-link');


if (id === 0) {
    loginLink.href = '/login'; // Endpoint para id = 0
} else if (id > 0) {
    loginLink.href = '/profile'; // Endpoint para id > 0
}


document.addEventListener('DOMContentLoaded', function () {
    console.log("📌 scripts.js cargado correctamente");

    document.body.addEventListener('click', function (event) {
        const likeBtn = event.target.closest('.like-comment-button');
        const dislikeBtn = event.target.closest('.dislike-comment-button');

        if (likeBtn) {
            const commentId = likeBtn.dataset.commentId;
            if (!commentId || isNaN(commentId)) {
                console.error("❌ Error: commentId inválido en like button", commentId);
                return;
            }
            handleCommentLikeDislike(commentId, true);
        }

        if (dislikeBtn) {
            const commentId = dislikeBtn.dataset.commentId;
            if (!commentId || isNaN(commentId)) {
                console.error("❌ Error: commentId inválido en dislike button", commentId);
                return;
            }
            handleCommentLikeDislike(commentId, false);
        }
    });

    function handleCommentLikeDislike(commentId, isLike) {
        console.log("🚀 Enviando like/dislike a /like-dislike-comment con:", commentId, isLike);

        fetch('/like-dislike-comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentId: parseInt(commentId, 10), isLike })
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Respuesta del servidor en profile.ejs:", data);

            if (data.success) {
                const likeCountSpan = document.querySelector(`.like-comment-count[data-comment-id="${commentId}"]`);
                const dislikeCountSpan = document.querySelector(`.dislike-comment-count[data-comment-id="${commentId}"]`);

                if (!likeCountSpan || !dislikeCountSpan) {
                    console.error(`❌ No se encontraron los contadores para actualizar likes/dislikes del comentario ${commentId}`);
                    return;
                }

                likeCountSpan.textContent = data.newLikes;
                dislikeCountSpan.textContent = data.newDislikes;
            } else {
                console.error("❌ Error en la respuesta del servidor:", data);
            }
        })
        .catch(error => console.error("❌ Error en profile.ejs al procesar la acción:", error));
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const solicitudForm = document.getElementById('solicitud-maestro-form');
    const solicitudesContainer = document.getElementById('solicitudes-container');

    if (solicitudForm) {
        solicitudForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const firstName = document.getElementById('first-name').value.trim();
            const lastName = document.getElementById('last-name').value.trim();

            if (!firstName || !lastName) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            fetch('/nueva-solicitud-maestro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                location.reload();
            })
            .catch(error => console.error('Error al enviar la solicitud:', error));
        });
    }

    if (solicitudesContainer) {
        fetch('/solicitudes-maestro')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.solicitudes.length > 0) {
                    solicitudesContainer.innerHTML = '';
                    data.solicitudes.forEach(solicitud => {
                        const div = document.createElement('div');
                        div.innerHTML = `
                            <div class="solicitud-item">
                                <p><strong>${solicitud.first_name} ${solicitud.last_name}</strong></p>
                                <button onclick="gestionarSolicitud(${solicitud.id}, 'approve')">✅ Aprobar</button>
                                <button onclick="gestionarSolicitud(${solicitud.id}, 'reject')">❌ Rechazar</button>
                            </div>
                        `;
                        solicitudesContainer.appendChild(div);
                    });
                } else {
                    solicitudesContainer.innerHTML = '<p>No hay solicitudes pendientes.</p>';
                }
            })
            .catch(error => console.error('Error al obtener las solicitudes:', error));
    }
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/solicitudes-maestro")
        .then(response => response.json())
        .then(data => {
            if (data.success && data.solicitudes.length > 0) {
                solicitudesContainer.innerHTML = "";
                data.solicitudes.forEach(solicitud => {
                    const div = document.createElement("div");
                    div.innerHTML = `
                        <div class="solicitud-item">
                            <p><strong>${solicitud.first_name} ${solicitud.last_name}</strong></p>
                            <button onclick="gestionarSolicitud(${solicitud.id}, 'approve')">✅ Aprobar</button>
                            <button onclick="gestionarSolicitud(${solicitud.id}, 'reject')">❌ Rechazar</button>
                        </div>
                    `;
                    solicitudesContainer.appendChild(div);
                });
            } else {
                solicitudesContainer.innerHTML = "<p>No hay solicitudes pendientes.</p>";
            }
        })
        .catch(error => console.error("Error al obtener las solicitudes:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("button[id^='reportButton-']").forEach(button => {
        const commentId = button.id.replace("reportButton-", ""); // Extraer ID correctamente
        const menu = document.getElementById(`reportMenu-${commentId}`);

        if (!menu) {
            console.warn(`No se encontró el menú para el comentario ${commentId}`);
            return;
        }

        button.addEventListener("click", function (event) {
            event.stopPropagation(); // Evita que se cierre automáticamente
            console.log(`Botón reportar clickeado para comentario: ${commentId}`);
            menu.classList.toggle("hidden");
        });

        document.querySelectorAll(`#reportMenu-${commentId} .report-option`).forEach(option => {
            option.addEventListener("click", function () {
                const reasonId = this.dataset.reasonId;

                console.log(`Enviando reporte de comentario ${commentId} con razón ${reasonId}`);

                if (typeof usuarioId === "undefined" || usuarioId === 0) {
                    alert("Debes iniciar sesión para reportar un comentario.");
                    return;
                }

                fetch("/newReport", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: usuarioId, 
                        comment_id: commentId, 
                        reason: reasonId
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Reporte enviado con éxito.");
                        menu.classList.add("hidden");
                    } else {
                        alert("Error al enviar el reporte.");
                    }
                })
                .catch(error => console.error("Error al reportar:", error));
            });
        });
    });

    // Cierra el menú al hacer clic en cualquier parte de la página
    document.addEventListener("click", function () {
        document.querySelectorAll("[id^='reportMenu-']").forEach(menu => menu.classList.add("hidden"));
    });
});
