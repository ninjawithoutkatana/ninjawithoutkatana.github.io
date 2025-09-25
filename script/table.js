const search = document.querySelector('.input-group input'),
    table_rows = document.querySelectorAll('tbody tr'),
    table_headings = document.querySelectorAll('thead th'),
    rows_per_page = 10;
let current_page = 1;

search.addEventListener('input', () => {
    searchTable();
    displayTablePage(1);
});

function searchTable() {
    let any_row_visible = false;

    table_rows.forEach((row) => {
        let table_data = row.textContent.toLowerCase(),
            search_data = search.value.toLowerCase();

        const row_visible = table_data.includes(search_data);
        row.classList.toggle('hide', !row_visible);

        if (row_visible) {
            any_row_visible = true;
        }
    });

    if (!any_row_visible) {
        showNoResultMessage();
    } else {
        hideNoResultMessage();
    }

    displayTablePage(current_page);
}

function showNoResultMessage() {
    const noResultMessage = document.createElement('div');
    noResultMessage.classList.add('no-result');
    noResultMessage.innerHTML = '<strong>Ештеңе табылмады</strong>';
    
    const tableContainer = document.querySelector('table').parentElement;
    if (!document.querySelector('.no-result')) {
        tableContainer.appendChild(noResultMessage);
    }
    
    document.querySelector('table').style.display = 'none';
    document.getElementById('pagination').style.display = 'none';
}

function hideNoResultMessage() {
    const noResultMessage = document.querySelector('.no-result');
    if (noResultMessage) {
        noResultMessage.remove();
    }

    document.querySelector('table').style.display = 'table';
    document.getElementById('pagination').style.display = 'flex';
}

table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
        table_headings.forEach(h => h.classList.remove('active'));
        head.classList.add('active');

        table_rows.forEach(row => {
            row.querySelectorAll('td').forEach(td => td.classList.remove('active'));
            row.querySelectorAll('td')[i].classList.add('active');
        });

        sort_asc = !head.classList.contains('asc');
        head.classList.toggle('asc', sort_asc);

        sortTable(i, sort_asc);
        displayTablePage(1);
    };
});

function sortTable(column, asc) {
    const sortedRows = [...table_rows].sort((a, b) => {
        let aText = a.querySelectorAll('td')[column].textContent.toLowerCase(),
            bText = b.querySelectorAll('td')[column].textContent.toLowerCase();

        return asc ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    sortedRows.forEach(row => document.querySelector('tbody').appendChild(row));
}

function displayTablePage(page) {
    current_page = page;
    const visible_rows = [...document.querySelectorAll('tbody tr:not(.hide)')];
    const start = (page - 1) * rows_per_page;
    const end = start + rows_per_page;

    visible_rows.forEach((row, i) => {
        row.style.display = (i >= start && i < end) ? '' : 'none';
        row.style.backgroundColor = (i % 2 === 1) ? '#0000000b' : 'transparent';
		
		row.style.setProperty('--delay', i / 25 + 's');
    });

    setupPagination(visible_rows.length);
}

function setupPagination(total) {
    const pagination = document.getElementById('pagination');
    const page_count = Math.ceil(total / rows_per_page);
    pagination.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Алдыңғы';
    prevBtn.disabled = current_page === 1;
    prevBtn.onclick = () => displayTablePage(current_page - 1);
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= page_count; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.toggle('active-page', i === current_page);
        btn.onclick = () => displayTablePage(i);
        pagination.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Келесі';
    nextBtn.disabled = current_page === page_count;
    nextBtn.onclick = () => displayTablePage(current_page + 1);
    pagination.appendChild(nextBtn);

    const info = document.createElement('span');
    info.className = 'page-indicator';
    const visible_rows = [...document.querySelectorAll('tbody tr:not(.hide)')];
    const start_row = (current_page - 1) * rows_per_page + 1;
    const end_row = Math.min(start_row + rows_per_page - 1, visible_rows.length);
	info.innerHTML = `<i class="fa-solid fa-file-alt"></i> ${start_row}-${end_row} / ${visible_rows.length} , <i class="fa-solid fa-file"></i> ${current_page} / ${page_count}`;
    pagination.appendChild(info);
}

displayTablePage(1);