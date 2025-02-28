document.addEventListener('DOMContentLoaded', () => {
    // Function to toggle section visibility and save state
    function toggleSection(header) {
        const content = header.nextElementSibling;
        const sectionId = header.getAttribute('data-section-id');

        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            header.querySelector('.arrow path').setAttribute('d', 'M2 8 L5 5 L8 8');
            localStorage.setItem(sectionId, 'expanded');
        } else {
            content.classList.add('hidden');
            header.querySelector('.arrow path').setAttribute('d', 'M2 2 L5 5 L8 2');
            localStorage.setItem(sectionId, 'collapsed');
        }
    }

    // Function to toggle all sections
    function toggleAllSections() {
        const sectionHeaders = document.querySelectorAll('.section-header');
        const anyExpanded = Array.from(sectionHeaders).some(header => !header.nextElementSibling.classList.contains('hidden'));

        sectionHeaders.forEach(header => {
            const content = header.nextElementSibling;
            const sectionId = header.getAttribute('data-section-id');

            if (anyExpanded) {
                content.classList.add('hidden');
                header.querySelector('.arrow path').setAttribute('d', 'M2 2 L5 5 L8 2');
                localStorage.setItem(sectionId, 'collapsed');
            } else {
                content.classList.remove('hidden');
                header.querySelector('.arrow path').setAttribute('d', 'M2 8 L5 5 L8 8');
                localStorage.setItem(sectionId, 'expanded');
            }
        });
    }

    // Add click event listeners to section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        const sectionId = header.getAttribute('data-section-id');
        const isCollapsed = localStorage.getItem(sectionId) === 'collapsed';

        if (isCollapsed) {
            const content = header.nextElementSibling;
            content.classList.add('hidden');
            header.querySelector('.arrow path').setAttribute('d', 'M2 2 L5 5 L8 2');
        }

        header.addEventListener('click', () => toggleSection(header));
    });

    // Add click event listeners to section links to preserve collapse state
    const sectionLinks = document.querySelectorAll('.section-content a');
    sectionLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.stopPropagation(); // Prevent the click from bubbling up to the header
        });
    });

    // Add event listener to the Toggle All button
    const toggleAllBtn = document.getElementById('collapse-all-btn');
    toggleAllBtn.addEventListener('click', toggleAllSections);
});
