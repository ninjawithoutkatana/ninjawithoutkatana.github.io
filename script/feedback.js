const API_BASE = 'https://68372aaf664e72d28e43d1b5.mockapi.io';

async function fetchLikeRecord(itemId) {
    try {
        const res = await fetch(`${API_BASE}/likes?itemId=${encodeURIComponent(itemId)}`);
        if (!res.ok) {
            console.error('Сұраныс қателігі:', res.status);
            return null;
        }
        const data = await res.json();
        if (data.length === 0) return null;
        return data[0];
    } catch (err) {
        console.error(`itemId=${itemId} үшін лайктарды жүктеу қатесі`, err);
        return null;
    }
}

async function createLikeRecord(itemId) {
    try {
        const res = await fetch(`${API_BASE}/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itemId,
                count: 0
            })
        });
        if (!res.ok) {
            console.error('Сұраныс қателігі:', res.status);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error(`itemId=${itemId} үшін лайк жазбасын құру қатесі`, err);
        return null;
    }
}

async function updateLikeRecord(likeRecord) {
    try {
        const newCount = likeRecord.count + 1;
        const res = await fetch(`${API_BASE}/likes/${likeRecord.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...likeRecord,
                count: newCount
            })
        });
        return await res.json();
    } catch (err) {
        console.error(`itemId=${likeRecord.itemId} үшін лайкты жаңарту қатесі`, err);
        return likeRecord;
    }
}

async function initLikes() {
    const likeBlocks = document.querySelectorAll('[data-item-id]');

    likeBlocks.forEach(async block => {
        const itemId = block.dataset.itemId;
        const likeBtn = block.querySelector('[data-like-btn]');
        const likeCountSpan = block.querySelector('[data-like-count]');
        if (!likeCountSpan) return;

        let likeRecord = await fetchLikeRecord(itemId);

        if (!likeRecord) {
            likeRecord = await createLikeRecord(itemId);
        }

        if (!likeRecord) {
            likeCountSpan.textContent = 0;
            return;
        }

        likeCountSpan.textContent = likeRecord.count;

        if (likeBtn) {
            if (!likeBtn.dataset.listenerAdded) {
                likeBtn.addEventListener('click', async () => {
                    likeRecord = await updateLikeRecord(likeRecord);
                    likeCountSpan.textContent = likeRecord.count;
                });
                likeBtn.dataset.listenerAdded = 'true';
            }
        }
    });
};

function initComments() {
    const commentsList = document.querySelector('[data-comments-list]');
    const commentForm = document.querySelector('[data-comment-form]');
    const authorInput = document.querySelector('[data-author-input]');
    const commentTextInput = document.querySelector('[data-text-input]');
    const paginationControls = document.querySelector('[data-pagination-controls]');

    if (!commentsList || !commentForm || !authorInput || !commentTextInput || !paginationControls) return;

    const sectionId = commentsList.dataset.sectionId;
    const COMMENTS_PER_PAGE = 5;
    let currentPage = 1;

    async function fetchComments(page = 1) {
        try {
            const res = await fetch(`${API_BASE}/comments?sectionId=${encodeURIComponent(sectionId)}&sortBy=timestamp&order=desc&page=${page}&limit=${COMMENTS_PER_PAGE}`);
            const data = await res.json();
            renderComments(data);
            updatePaginationControls(data.length);
        } catch (err) {
            console.error('Пікірлерді жүктеу қатесі', err);
        }
    };

    function renderComments(comments) {
        commentsList.innerHTML = '';
        if (comments.length === 0) {
            commentsList.textContent = 'Әзірге пікірлер жоқ.';
            return;
        }
        comments.forEach(({
            author,
            text,
            timestamp
        }) => {
            const dateStr = new Date(timestamp * 1000).toLocaleString('kk-KZ');
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';

            const authorDiv = document.createElement('div');
            authorDiv.className = 'comment-author';
            authorDiv.textContent = author;

            const dateDiv = document.createElement('div');
            dateDiv.className = 'comment-date';
            dateDiv.textContent = dateStr;

            const textDiv = document.createElement('div');
            textDiv.className = 'comment-text';
            textDiv.textContent = text;

            commentDiv.appendChild(authorDiv);
            commentDiv.appendChild(dateDiv);
            commentDiv.appendChild(textDiv);

            commentsList.appendChild(commentDiv);
        });
    };

    function updatePaginationControls(receivedCount) {
        if (receivedCount < COMMENTS_PER_PAGE && currentPage === 1) {
            paginationControls.classList.remove('visible');
            return;
        }

        paginationControls.classList.add('visible');
        paginationControls.innerHTML = `
      <button ${currentPage === 1 ? 'disabled' : ''} data-prev-btn>Алдыңғы</button>
      <span>${currentPage}-бет</span>
      <button ${receivedCount < COMMENTS_PER_PAGE ? 'disabled' : ''} data-next-btn>Келесі</button>
    `;

        const prevBtn = paginationControls.querySelector('[data-prev-btn]');
        const nextBtn = paginationControls.querySelector('[data-next-btn]');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    fetchComments(currentPage);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentPage++;
                fetchComments(currentPage);
            });
        }
    };

    commentForm.addEventListener('submit', async e => {
        e.preventDefault();

        const author = authorInput.value.trim();
        const text = commentTextInput.value.trim();

        if (!author || !text) return;

        const newComment = {
            sectionId,
            author,
            text,
            timestamp: Math.floor(Date.now() / 1000)
        };

        try {
            await fetch(`${API_BASE}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newComment)
            });
            authorInput.value = '';
            commentTextInput.value = '';
            currentPage = 1;
            fetchComments(currentPage);
        } catch (err) {
            console.error('Пікірді қосу қатесі', err);
        };
    });

    fetchComments(currentPage);
}

document.addEventListener('DOMContentLoaded', () => {
    initLikes();
    initComments();
});

document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-like-btn]');
    if (!btn) return;

    btn.style.animation = 'heartPulse 0.5s ease';
    btn.addEventListener('animationend', () => {
        btn.style.animation = '';
    }, {
        once: true
    });

    setTimeout(() => {
        fx.remove();
    }, 600);
});
