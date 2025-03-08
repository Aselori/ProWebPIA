;(() => {
    console.log("===> professor_likes.js cargado <===");

    const singleProfessorIdInput = document.getElementById('profesor-id');
    const iconSize = singleProfessorIdInput ? 40 : 20;
  
    // SVGs para profesor
    const likedSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.2699 16.265L20.9754 12.1852C21.1516 11.1662 20.368 10.2342 19.335 10.2342H14.1539C13.6404 10.2342 13.2494 9.77328 13.3325 9.26598L13.9952 5.22142C14.1028 4.56435 14.0721 3.892 13.9049 3.24752C13.7664 2.71364 13.3545 2.28495 12.8128 2.11093L12.6678 2.06435C12.3404 1.95918 11.9831 1.98365 11.6744 2.13239C11.3347 2.29611 11.0861 2.59473 10.994 2.94989L10.5183 4.78374C10.3669 5.36723 10.1465 5.93045 9.86218 6.46262C9.44683 7.24017 8.80465 7.86246 8.13711 8.43769L6.69838 9.67749C6.29272 10.0271 6.07968 10.5506 6.12584 11.0844L6.93801 20.4771C7.0125 21.3386 7.7328 22 8.59658 22H13.2452C16.7265 22 19.6975 19.5744 20.2699 16.265Z" fill="#000000"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M2.96767 9.48508C3.36893 9.46777 3.71261 9.76963 3.74721 10.1698L4.71881 21.4063C4.78122 22.1281 4.21268 22.7502 3.48671 22.7502C2.80289 22.7502 2.25 22.1954 2.25 21.5129V10.2344C2.25 9.83275 2.5664 9.5024 2.96767 9.48508Z" fill="#000000"></path> </g></svg>`;
    const dislikedSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.2699 8.48505L20.9754 12.5648C21.1516 13.5838 20.368 14.5158 19.335 14.5158H14.1539C13.6404 14.5158 13.2494 14.9767 13.3325 15.484L13.9952 19.5286C14.1028 20.1857 14.0721 20.858 13.9049 21.5025C13.7664 22.0364 13.3545 22.465 12.8128 22.6391L12.6678 22.6856C12.3404 22.7908 11.9831 22.7663 11.6744 22.6176C11.3347 22.4539 11.0861 22.1553 10.994 21.8001L10.5183 19.9663C10.3669 19.3828 10.1465 18.8195 9.86218 18.2874C9.44683 17.5098 8.80465 16.8875 8.13711 16.3123L6.69838 15.0725C6.29272 14.7229 6.07968 14.1994 6.12584 13.6656L6.93801 4.27293C7.0125 3.41139 7.7328 2.75 8.59658 2.75H13.2452C16.7265 2.75 19.6975 5.17561 20.2699 8.48505Z" fill="#000000"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M2.96767 15.2651C3.36893 15.2824 3.71261 14.9806 3.74721 14.5804L4.71881 3.34389C4.78122 2.6221 4.21268 2 3.48671 2C2.80289 2 2.25 2.55474 2.25 3.23726V14.5158C2.25 14.9174 2.5664 15.2478 2.96767 15.2651Z" fill="#000000"></path> </g></svg>`;
    const neutralLikeSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.9752 12.1852L20.2361 12.0574L20.9752 12.1852ZM20.2696 16.265L19.5306 16.1371L20.2696 16.265ZM6.93777 20.4771L6.19056 20.5417L6.93777 20.4771ZM6.12561 11.0844L6.87282 11.0198L6.12561 11.0844ZM13.995 5.22142L14.7351 5.34269V5.34269L13.995 5.22142ZM13.3323 9.26598L14.0724 9.38725V9.38725L13.3323 9.26598ZM6.69814 9.67749L6.20855 9.10933H6.20855L6.69814 9.67749ZM8.13688 8.43769L8.62647 9.00585H8.62647L8.13688 8.43769ZM10.5181 4.78374L9.79208 4.59542L10.5181 4.78374ZM10.9938 2.94989L11.7197 3.13821V3.13821L10.9938 2.94989ZM12.6676 2.06435L12.4382 2.77841L12.4382 2.77841L12.6676 2.06435ZM12.8126 2.11093L13.042 1.39687L13.042 1.39687L12.8126 2.11093ZM9.86195 6.46262L10.5235 6.81599V6.81599L9.86195 6.46262ZM13.9047 3.24752L13.1787 3.43584V3.43584L13.9047 3.24752ZM11.6742 2.13239L11.3486 1.45675V1.45675L11.6742 2.13239ZM3.9716 21.4707L3.22439 21.5353L3.9716 21.4707ZM3 10.2342L3.74721 10.1696C3.71261 9.76945 3.36893 9.46758 2.96767 9.4849C2.5664 9.50221 2.25 9.83256 2.25 10.2342H3ZM20.2361 12.0574L19.5306 16.1371L21.0087 16.3928L21.7142 12.313L20.2361 12.0574ZM13.245 21.25H8.59635V22.75H13.245V21.25ZM7.68498 20.4125L6.87282 11.0198L5.3784 11.149L6.19056 20.5417L7.68498 20.4125ZM19.5306 16.1371C19.0238 19.0677 16.3813 21.25 13.245 21.25V22.75C17.0712 22.75 20.3708 20.081 21.0087 16.3928L19.5306 16.1371ZM13.2548 5.10015L12.5921 9.14472L14.0724 9.38725L14.7351 5.34269L13.2548 5.10015ZM7.18773 10.2456L8.62647 9.00585L7.64729 7.86954L6.20855 9.10933L7.18773 10.2456ZM11.244 4.97206L11.7197 3.13821L10.2678 2.76157L9.79208 4.59542L11.244 4.97206ZM12.4382 2.77841L12.5832 2.82498L13.042 1.39687L12.897 1.3503L12.4382 2.77841ZM10.5235 6.81599C10.8354 6.23198 11.0777 5.61339 11.244 4.97206L9.79208 4.59542C9.65573 5.12107 9.45699 5.62893 9.20042 6.10924L10.5235 6.81599ZM12.5832 2.82498C12.8896 2.92342 13.1072 3.16009 13.1787 3.43584L14.6307 3.05921C14.4252 2.26719 13.819 1.64648 13.042 1.39687L12.5832 2.82498ZM11.7197 3.13821C11.7548 3.0032 11.8523 2.87913 11.9998 2.80804L11.3486 1.45675C10.8166 1.71309 10.417 2.18627 10.2678 2.76157L11.7197 3.13821ZM11.9998 2.80804C12.1345 2.74311 12.2931 2.73181 12.4382 2.77841L12.897 1.3503C12.3873 1.18655 11.8312 1.2242 11.3486 1.45675L11.9998 2.80804ZM14.1537 10.9842H19.3348V9.4842H14.1537V10.9842ZM4.71881 21.4061L3.74721 10.1696L2.25279 10.2988L3.22439 21.5353L4.71881 21.4061ZM3.75 21.5127V10.2342H2.25V21.5127H3.75ZM3.22439 21.5353C3.2112 21.3828 3.33146 21.25 3.48671 21.25V22.75C4.21268 22.75 4.78122 22.1279 4.71881 21.4061L3.22439 21.5353ZM14.7351 5.34269C14.8596 4.58256 14.8241 3.80477 14.6307 3.0592L13.1787 3.43584C13.3197 3.97923 13.3456 4.54613 13.2548 5.10016L14.7351 5.34269ZM8.59635 21.25C8.12244 21.25 7.72601 20.887 7.68498 20.4125L6.19056 20.5417C6.29852 21.7902 7.3427 22.75 8.59635 22.75V21.25ZM8.62647 9.00585C9.30632 8.42 10.0392 7.72267 10.5235 6.81599L9.20042 6.10924C8.85404 6.75767 8.3025 7.30493 7.64729 7.86954L8.62647 9.00585ZM21.7142 12.313C21.9695 10.8365 20.8341 9.4842 19.3348 9.4842V10.9842C19.9014 10.9842 20.3332 11.4959 20.2361 12.0574L21.7142 12.313ZM3.48671 21.25C3.63292 21.25 3.75 21.3684 3.75 21.5127H2.25C2.25 22.1953 2.80289 22.75 3.48671 22.75V21.25ZM12.5921 9.14471C12.4344 10.1076 13.1766 10.9842 14.1537 10.9842V9.4842C14.1038 9.4842 14.0639 9.43901 14.0724 9.38725L12.5921 9.14471ZM6.87282 11.0198C6.8474 10.7258 6.96475 10.4378 7.18773 10.2456L6.20855 9.10933C5.62022 9.61631 5.31149 10.3753 5.3784 11.149L6.87282 11.0198Z" fill="#000000"></path> </g></svg>`;
    const neutralDislikeSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.9752 11.8148L20.2361 11.9426L20.9752 11.8148ZM20.2696 7.73505L19.5306 7.86285L20.2696 7.73505ZM6.93777 3.52293L6.19056 3.45832L6.93777 3.52293ZM6.12561 12.9156L6.87282 12.9802L6.12561 12.9156ZM13.995 18.7786L14.7351 18.6573V18.6573L13.995 18.7786ZM13.3323 14.734L14.0724 14.6128V14.6128L13.3323 14.734ZM6.69814 14.3225L6.20855 14.8907H6.20855L6.69814 14.3225ZM8.13688 15.5623L8.62647 14.9942H8.62647L8.13688 15.5623ZM10.5181 19.2163L9.79208 19.4046L10.5181 19.2163ZM10.9938 21.0501L11.7197 20.8618V20.8618L10.9938 21.0501ZM12.6676 21.9356L12.4382 21.2216L12.4382 21.2216L12.6676 21.9356ZM12.8126 21.8891L13.042 22.6031L13.042 22.6031L12.8126 21.8891ZM9.86195 17.5374L10.5235 17.184V17.184L9.86195 17.5374ZM13.9047 20.7525L13.1787 20.5642V20.5642L13.9047 20.7525ZM11.6742 21.8676L11.3486 22.5433V22.5433L11.6742 21.8676ZM3.9716 2.52928L3.22439 2.46467L3.9716 2.52928ZM3 13.7658L3.74721 13.8304C3.71261 14.2306 3.36893 14.5324 2.96767 14.5151C2.5664 14.4978 2.25 14.1674 2.25 13.7658H3ZM20.2361 11.9426L19.5306 7.86285L21.0087 7.60724L21.7142 11.687L20.2361 11.9426ZM13.245 2.75H8.59635V1.25H13.245V2.75ZM7.68498 3.58754L6.87282 12.9802L5.3784 12.851L6.19056 3.45832L7.68498 3.58754ZM19.5306 7.86285C19.0238 4.93226 16.3813 2.75 13.245 2.75V1.25C17.0712 1.25 20.3708 3.91895 21.0087 7.60724L19.5306 7.86285ZM13.2548 18.8998L12.5921 14.8553L14.0724 14.6128L14.7351 18.6573L13.2548 18.8998ZM7.18773 13.7544L8.62647 14.9942L7.64729 16.1305L6.20855 14.8907L7.18773 13.7544ZM11.244 19.0279L11.7197 20.8618L10.2678 21.2384L9.79208 19.4046L11.244 19.0279ZM12.4382 21.2216L12.5832 21.175L13.042 22.6031L12.897 22.6497L12.4382 21.2216ZM10.5235 17.184C10.8354 17.768 11.0777 18.3866 11.244 19.0279L9.79208 19.4046C9.65573 18.8789 9.45699 18.3711 9.20042 17.8908L10.5235 17.184ZM12.5832 21.175C12.8896 21.0766 13.1072 20.8399 13.1787 20.5642L14.6307 20.9408C14.4252 21.7328 13.819 22.3535 13.042 22.6031L12.5832 21.175ZM11.7197 20.8618C11.7548 20.9968 11.8523 21.1209 11.9998 21.192L11.3486 22.5433C10.8166 22.2869 10.417 21.8137 10.2678 21.2384L11.7197 20.8618ZM11.9998 21.192C12.1345 21.2569 12.2931 21.2682 12.4382 21.2216L12.897 22.6497C12.3873 22.8135 11.8312 22.7758 11.3486 22.5433L11.9998 21.192ZM14.1537 13.0158H19.3348V14.5158H14.1537V13.0158ZM4.71881 2.59389L3.74721 13.8304L2.25279 13.7012L3.22439 2.46467L4.71881 2.59389ZM3.75 2.48726V13.7658H2.25V2.48726H3.75ZM3.22439 2.46467C3.2112 2.61722 3.33146 2.75 3.48671 2.75V1.25C4.21268 1.25 4.78122 1.8721 4.71881 2.59389L3.22439 2.46467ZM14.7351 18.6573C14.8596 19.4174 14.8241 20.1952 14.6307 20.9408L13.1787 20.5642C13.3197 20.0208 13.3456 19.4539 13.2548 18.8998L14.7351 18.6573ZM8.59635 2.75C8.12244 2.75 7.72601 3.11302 7.68498 3.58754L6.19056 3.45832C6.29852 2.20975 7.3427 1.25 8.59635 1.25V2.75ZM8.62647 14.9942C9.30632 15.58 10.0392 16.2773 10.5235 17.184L9.20042 17.8908C8.85404 17.2423 8.3025 16.6951 7.64729 16.1305L8.62647 14.9942ZM21.7142 11.687C21.9695 13.1635 20.8341 14.5158 19.3348 14.5158V13.0158C19.9014 13.0158 20.3332 12.5041 20.2361 11.9426L21.7142 11.687ZM3.48671 2.75C3.63292 2.75 3.75 2.63156 3.75 2.48726H2.25C2.25 1.80474 2.80289 1.25 3.48671 1.25V2.75ZM12.5921 14.8553C12.4344 13.8924 13.1766 13.0158 14.1537 13.0158V14.5158C14.1038 14.5158 14.0639 14.561 14.0724 14.6128L12.5921 14.8553ZM6.87282 12.9802C6.8474 13.2742 6.96475 13.5622 7.18773 13.7544L6.20855 14.8907C5.62022 14.3837 5.31149 13.6247 5.3784 12.851L6.87282 12.9802Z" fill="#000000"></path> </g></svg>`;
    
    // Funciones auxiliares para llamar al backend

    function fetchProfessorLikesStatus(professorId) {
        return fetch(`/professor-likes-status?profesorId=${professorId}`)
            .then(r => r.json())
            .catch(err => {
                console.error("Error en fetchProfessorLikesStatus", err);
                return { success: false };
            });
    }

    function setProfessorLikeDislike(professorId, isLike) {
        return fetch('/like-dislike', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profesorId: professorId, isLike })
        })
        .then(r => r.json())
        .catch(err => {
            console.error("Error en setProfessorLikeDislike", err);
            return { success: false };
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const singleProfessorIdInput = document.getElementById('profesor-id');
        const likeBtnSingle = document.getElementById('like-button');
        const dislikeBtnSingle = document.getElementById('dislike-button');
        const likesSpanSingle = document.getElementById('likes');
        const dislikesSpanSingle = document.getElementById('dislikes');

        if (singleProfessorIdInput) {
            const professorId = singleProfessorIdInput.value;

            // Obtener estado actual
            fetchProfessorLikesStatus(professorId).then(data => {
                if (data.success) {
                    updateSingleProfessorUI(data.hasLiked);
                }
            });

            if (likeBtnSingle) {
                likeBtnSingle.addEventListener('click', () => {
                    setProfessorLikeDislike(professorId, true).then(data => {
                        if (data.success) {
                            if (likesSpanSingle) likesSpanSingle.textContent = data.newLikes;
                            if (dislikesSpanSingle) dislikesSpanSingle.textContent = data.newDislikes;
                            updateSingleProfessorUI(true);
                        } else {
                            alert(data.message || "Debes iniciar sesión para dar like/dislike");
                        }
                    });
                });
            }

            if (dislikeBtnSingle) {
                dislikeBtnSingle.addEventListener('click', () => {
                    setProfessorLikeDislike(professorId, false).then(data => {
                        if (data.success) {
                            if (likesSpanSingle) likesSpanSingle.textContent = data.newLikes;
                            if (dislikesSpanSingle) dislikesSpanSingle.textContent = data.newDislikes;
                            updateSingleProfessorUI(false);
                        } else {
                            alert(data.message || "Debes iniciar sesión para dar like/dislike");
                        }
                    });
                });
            }

            function updateSingleProfessorUI(hasLiked) {
                if (!likeBtnSingle || !dislikeBtnSingle) return;
                if (hasLiked === true) {
                    likeBtnSingle.innerHTML = likedSvg;
                    dislikeBtnSingle.innerHTML = neutralDislikeSvg;
                } else if (hasLiked === false) {
                    likeBtnSingle.innerHTML = neutralLikeSvg;
                    dislikeBtnSingle.innerHTML = dislikedSvg;
                } else {
                    likeBtnSingle.innerHTML = neutralLikeSvg;
                    dislikeBtnSingle.innerHTML = neutralDislikeSvg;
                }
            }

        } else {
            // Si estamos en la lista de profesores (index.ejs)
            document.querySelectorAll('.like-button, .dislike-button').forEach(btn => {
                const professorId = btn.dataset.profesorId;
                fetchProfessorLikesStatus(professorId).then(data => {
                    if (data.success && data.hasLiked !== null) {
                        if (data.hasLiked === true) {
                            const likeButton = document.querySelector(`.like-button[data-profesor-id="${professorId}"]`);
                            if (likeButton) likeButton.innerHTML = likedSvg;
                        } else {
                            const dislikeButton = document.querySelector(`.dislike-button[data-profesor-id="${professorId}"]`);
                            if (dislikeButton) dislikeButton.innerHTML = dislikedSvg;
                        }
                    }
                });
            });

            // Agregar `preventDefault()` y `stopPropagation()` a los botones
            document.addEventListener('click', event => {
                const likeBtn = event.target.closest('.like-button');
                const dislikeBtn = event.target.closest('.dislike-button');

                if (likeBtn || dislikeBtn) {
                    event.preventDefault();   // Evita la redirección
                    event.stopPropagation(); // Evita que el evento suba al <a> padre
                }

                if (likeBtn) {
                    const professorId = likeBtn.dataset.profesorId;
                    setProfessorLikeDislike(professorId, true).then(data => {
                        if (!data.success) {
                            alert(data.message || 'Debes iniciar sesión para dar like/dislike');
                            return;
                        }
                        const likeCountEl = document.querySelector(`.like-count[data-profesor-id="${professorId}"]`);
                        const dislikeCountEl = document.querySelector(`.dislike-count[data-profesor-id="${professorId}"]`);
                        if (likeCountEl) likeCountEl.textContent = data.newLikes;
                        if (dislikeCountEl) dislikeCountEl.textContent = data.newDislikes;

                        likeBtn.innerHTML = likedSvg;
                        const dBtn = document.querySelector(`.dislike-button[data-profesor-id="${professorId}"]`);
                        if (dBtn) dBtn.innerHTML = neutralDislikeSvg;
                    });
                }

                if (dislikeBtn) {
                    const professorId = dislikeBtn.dataset.profesorId;
                    setProfessorLikeDislike(professorId, false).then(data => {
                        if (!data.success) {
                            alert(data.message || 'Debes iniciar sesión para dar like/dislike');
                            return;
                        }
                        const likeCountEl = document.querySelector(`.like-count[data-profesor-id="${professorId}"]`);
                        const dislikeCountEl = document.querySelector(`.dislike-count[data-profesor-id="${professorId}"]`);
                        if (likeCountEl) likeCountEl.textContent = data.newLikes;
                        if (dislikeCountEl) dislikeCountEl.textContent = data.newDislikes;

                        dislikeBtn.innerHTML = dislikedSvg;
                        const lBtn = document.querySelector(`.like-button[data-profesor-id="${professorId}"]`);
                        if (lBtn) lBtn.innerHTML = neutralLikeSvg;
                    });
                }
            });
        }
    });
})();