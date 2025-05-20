async function updateReportStatus(reportId) {
    try {
        const response = await fetch('/updateStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reportId, newStatus: 4 })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Estado actualizado correctamente');
            location.reload(); // Recargar la página para ver los cambios
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
    }
}

    document.addEventListener("DOMContentLoaded", function () {
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        if (message) {
            alert(message); // Muestra la alerta con el mensaje de éxito o error
        }
    });



function agregarRegistro(event, tableName) {
    event.preventDefault(); // Prevenir el envío tradicional del formulario
    const form = event.target;
    const formData = new FormData(form);

    fetch(`/dashboard/${tableName}/add`, {
        method: 'POST',
        body: new URLSearchParams(formData) // Enviar datos como formulario
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Registro agregado correctamente');
            window.location.href = `/dashboard/${tableName}`;
        } else {
            alert('Error al agregar registro: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al procesar la solicitud.');
    });
}

    async function deleteCrud(id, tabla) {
    console.log("Intentando eliminar registro de la tabla:", tabla, "con ID:", id);

    if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) return;

    try {
        const response = await fetch('/deleteCrud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, tabla })
        });

        const result = await response.json();
        console.log("Respuesta del servidor:", result);

        if (result.success) {
            alert('Registro eliminado correctamente');
            location.reload(); // Recargar la página para ver los cambios
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('tr');
            row.querySelectorAll('td[data-key]').forEach(td => {
                const key = td.dataset.key;
                const span = td.querySelector('span');
                const input = td.querySelector('input');

                if (["id", "created_at", "updated_at", "professor", "subject"].includes(key)) return;

                input.classList.remove('hidden');
                span.classList.add('hidden');
            });

            // Ocultar botón "Editar" y mostrar "Guardar"
            this.classList.add('hidden');
            row.querySelector('.save-btn').classList.remove('hidden');

            // Cambiar botón "Eliminar" a "Cancelar"
            row.querySelector('.delete-btn').classList.add('hidden');
            row.querySelector('.cancel-btn').classList.remove('hidden');
        });
    });

    document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('tr');
            const id = parseInt(this.dataset.id, 10);
            const tableName = this.dataset.table;
            let data = { id };

            row.querySelectorAll('td[data-key]').forEach(td => {
                const key = td.dataset.key;
                const input = td.querySelector('input');

                if (!input || ["id", "created_at", "updated_at", "professor", "subject"].includes(key)) return;

                data[key] = input.value;
            });

            console.log("Enviando datos a /dashboard/update:", JSON.stringify({ tableName, ...data }));

            fetch(`/dashboard/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableName, ...data })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    row.querySelectorAll('td[data-key]').forEach(td => {
                        const key = td.dataset.key;
                        const input = td.querySelector('input');
                        const span = td.querySelector('span');

                        if (!input || ["id", "created_at", "updated_at", "preview"].includes(key)) return;


                        span.textContent = input.value;
                        input.classList.add('hidden');
                        span.classList.remove('hidden');
                    });

                    this.classList.add('hidden');
                    row.querySelector('.edit-btn').classList.remove('hidden');

                    // Restaurar el botón de eliminar
                    row.querySelector('.delete-btn').classList.remove('hidden');
                    row.querySelector('.cancel-btn').classList.add('hidden');
                } else {
                    alert("Error al actualizar.");
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });

    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('tr');

            // Revertir los valores de los inputs
            row.querySelectorAll('td[data-key]').forEach(td => {
                const input = td.querySelector('input');
                const span = td.querySelector('span');

                if (input) {
                    input.classList.add('hidden');
                    span.classList.remove('hidden');
                }
            });

            // Restaurar botones
            row.querySelector('.edit-btn').classList.remove('hidden');
            row.querySelector('.save-btn').classList.add('hidden');
            row.querySelector('.delete-btn').classList.remove('hidden');
            this.classList.add('hidden'); // Ocultar botón de cancelar
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("busqueda");
    
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            const searchValue = this.value.toLowerCase();
            const rows = document.querySelectorAll("tbody tr");

            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(searchValue) ? "" : "none";
            });
        });
    }
});

function processRequestAndRemoveRow(button, id, action) {
    fetch('/gestionar-solicitud-maestro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const row = button.closest('tr');
        if (row) row.remove();
      } else {
        alert('Error: ' + data.message);
      }
    })
    .catch(err => {
      console.error('Error processing request:', err);
      alert('Error al procesar solicitud');
    });
  }
  
    
  async function resolverReporte(reportId, commentId) {
    if (!confirm("¿Estás seguro de que deseas resolver este reporte y eliminar el comentario?")) return;

    try {
        const response = await fetch('/resolverReporte', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId, commentId })
        });

        const result = await response.json();
        if (result.success) {
            alert('Reporte resuelto y comentario eliminado.');
            location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error al resolver el reporte:', error);
    }
}


function setupAutocomplete(inputSelector, endpoint) {
  const input = document.querySelector(inputSelector);
  const results = document.createElement("ul");
  results.className = "autocomplete-list absolute bg-white border border-gray-300 mt-1 z-50 hidden";
  input.parentNode.appendChild(results);

  let selectedIndex = -1;

  input.addEventListener("input", async () => {
    const val = input.value.trim();
    if (!val) return results.classList.add("hidden");

    const res = await fetch(`${endpoint}?q=${encodeURIComponent(val)}`);
    const options = await res.json();

    results.innerHTML = '';
    options.forEach((opt, i) => {
      const item = document.createElement("li");
      item.textContent = opt;
      item.className = "px-4 py-2 hover:bg-gray-200 cursor-pointer";
      item.addEventListener("click", () => {
        input.value = opt;
        results.classList.add("hidden");
      });
      results.appendChild(item);
    });

    selectedIndex = -1;
    results.classList.remove("hidden");
  });

  input.addEventListener("keydown", e => {
    const items = results.querySelectorAll("li");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      selectedIndex = (selectedIndex + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        input.value = items[selectedIndex].textContent;
        results.classList.add("hidden");
      }
    }

    items.forEach((item, idx) => {
      item.classList.toggle("bg-blue-100", idx === selectedIndex);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.href.includes("professor_subjects")) {
    setupAutocomplete('input[name="professor_name"]', "/buscar");
    setupAutocomplete('input[name="subject_name"]', "/buscar-materias");
  }
});





