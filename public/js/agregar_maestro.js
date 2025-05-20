document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("solicitud-maestro-form");
    const subjectInput = document.getElementById("subject-name");
    const dropdown = document.getElementById("subject-dropdown");

    let selectedIndex = -1;
    let currentSuggestions = [];

    subjectInput.addEventListener("input", async function () {
        const query = subjectInput.value.trim();
        dropdown.innerHTML = '';
        dropdown.classList.add("hidden");

        if (query.length < 2) return;

        try {
            const response = await fetch(`/buscar-materias?q=${encodeURIComponent(query)}`);
            currentSuggestions = await response.json();

            if (currentSuggestions.length === 0) return;

            currentSuggestions.forEach((name, index) => {
                const item = document.createElement("li");
                item.textContent = name;
                item.className = "cursor-pointer px-4 py-2 hover:bg-blue-100";
                item.addEventListener("click", () => {
                    subjectInput.value = name;
                    dropdown.classList.add("hidden");
                });
                dropdown.appendChild(item);
            });

            dropdown.classList.remove("hidden");
        } catch (err) {
            console.error("Error al buscar materias:", err);
        }
    });

    subjectInput.addEventListener("keydown", function (e) {
        const items = dropdown.querySelectorAll("li");
        if (items.length === 0) return;

        if (e.key === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % items.length;
        } else if (e.key === "ArrowUp") {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < items.length) {
                subjectInput.value = items[selectedIndex].textContent;
                dropdown.classList.add("hidden");
            }
            return;
        } else {
            selectedIndex = -1;
        }

        items.forEach((item, index) => {
            item.classList.toggle("bg-blue-100", index === selectedIndex);
        });
    });

    document.addEventListener("click", function (e) {
        if (!dropdown.contains(e.target) && e.target !== subjectInput) {
            dropdown.classList.add("hidden");
        }
    });

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(form);

            fetch("/nueva-solicitud-maestro", {
                method: "POST",
                body: new URLSearchParams(formData),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    form.reset();
                    dropdown.classList.add("hidden");
                }
            })
            .catch(err => console.error("Error al enviar la solicitud:", err));
        });
    }
});
