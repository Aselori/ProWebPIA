document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ scripts.js ha sido cargado correctamente.");

    // Campo de búsqueda
    const busquedaInput = document.getElementById('busqueda');
    const resultadosList = document.getElementById('resultados');

    if (busquedaInput) {
        busquedaInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length > 0) {
                fetch(`/buscar?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    resultadosList.innerHTML = '';
                    data.forEach(item => {
                        if (item.trim() !== '') {
                            const li = document.createElement('li');
                            li.className = 'p-2 hover:bg-gray-200 cursor-pointer';
                            li.textContent = item;
                            li.addEventListener('click', function() {
                                window.location.href = `/perfil-profesor?q=${encodeURIComponent(item)}`;
                            });
                            resultadosList.appendChild(li);
                        }
                    });
                })
                .catch(error => console.error('Error en la búsqueda:', error));
            } else {
                resultadosList.innerHTML = '';
            }
        });

        busquedaInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const query = this.value.trim();
                if (query.length > 0) {
                    window.location.href = `/perfil-profesor?q=${encodeURIComponent(query)}`;
                } else {
                    console.error("⚠️ No se puede redirigir porque la consulta está vacía.");
                }
            }
        });
    }

    // Funcionalidad del dropdown de rating
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const selectedOption = document.getElementById('selectedOption');
    const profesorContainer = document.querySelector('.grid.grid-cols-3');

    if (dropdownButton && dropdownMenu && selectedOption && profesorContainer) {
        dropdownButton.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });

        dropdownMenu.addEventListener('click', (event) => {
            const selectedValue = event.target.getAttribute('data-value');
            if (selectedValue) {
                selectedOption.textContent = selectedValue;
                sortProfesores(selectedValue);
            }
            dropdownMenu.classList.add('hidden');
        });

        function sortProfesores(order) {
            const profesorCards = Array.from(profesorContainer.getElementsByClassName('profesor-card'));
            if (profesorCards.length === 0) return;

            profesorCards.sort((a, b) => {
                const diffA = parseInt(a.getAttribute('data-diff'), 10) || 0;
                const diffB = parseInt(b.getAttribute('data-diff'), 10) || 0;
                return order === 'Rating Asc' ? diffA - diffB : diffB - diffA;
            });

            profesorCards.forEach(card => profesorContainer.appendChild(card));
        }

        document.addEventListener('click', (event) => {
            if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.add('hidden');
            }
        });

        sortProfesores('Rating Desc');
    }

    // Manejo de sesión para login
    let id = "<%= usuario.id %>";
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.href = id === "0" ? '/login' : '/profile';
    }

    // Funcionalidad de solicitudes de maestro
    const solicitudForm = document.getElementById('solicitud-maestro-form');
    const solicitudesContainer = document.getElementById('solicitudes-container');

    if (solicitudForm) {
        solicitudForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const firstName = document.getElementById('first-name').value.trim();
            const lastName = document.getElementById('last-name').value.trim();

            if (!firstName || !lastName) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            fetch('/nueva-solicitud-maestro', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
                        </div>`;
                    solicitudesContainer.appendChild(div);
                });
            } else {
                solicitudesContainer.innerHTML = '<p>No hay solicitudes pendientes.</p>';
            }
        })
        .catch(error => console.error('Error al obtener las solicitudes:', error));
    }

    // Evento para mostrar/ocultar el menú de reporte
    document.addEventListener("click", function(event) {
        if (event.target.closest("[id^='reportButton-']")) {
            event.stopPropagation(); // Evita que se cierre inmediatamente
            const commentId = event.target.closest("button").id.split("-")[1];
            const menu = document.getElementById(`reportMenu-${commentId}`);
            if (menu) {
                console.log("🔹 Mostrando menú de reporte:", menu.id);
                menu.classList.toggle("hidden");
            }
        } else {
            // Si se hace clic fuera, esconder todos los menús
            document.querySelectorAll("[id^='reportMenu-']").forEach(menu => menu.classList.add("hidden"));
        }
    });

    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("report-option")) {
            const commentId = event.target.getAttribute("data-comment-id");
            const reasonId = event.target.getAttribute("data-reason-id");

            console.log(`📡 Enviando reporte -> Comentario ID: ${commentId}, Razón ID: ${reasonId}`);

            fetch('/newReport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment_id: commentId, reason: reasonId })
            })
            .then(response => response.json())
            .then(data => {
                alert(`✅ Reporte enviado: ${data.message}`);
                console.log("✅ Respuesta del servidor:", data);
            })
            .catch(error => console.error("❌ Error al enviar el reporte:", error));
        }
    });

    // Manejo de comentarios
    const comentarioForm = document.getElementById('comentario-form');     
    if (comentarioForm) {
        comentarioForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const profesorId = document.getElementById('profesor-id')?.value;
            const usuarioId = document.getElementById('usuario-id')?.value;
            const materiaSeleccionada = document.getElementById('materia-select')?.value;
            const comentario = document.getElementById('comment')?.value.trim();

            if (!profesorId || !usuarioId || !materiaSeleccionada || !comentario) {
                alert("Todos los campos son obligatorios.");
                return;
            }

            fetch('/post_comentario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profesorId, usuarioId, materia: materiaSeleccionada, comentario })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Comentario enviado con éxito.');
                    location.reload();
                }
            })
            .catch(error => console.error('Error al enviar el comentario:', error));
        });
    }
});
