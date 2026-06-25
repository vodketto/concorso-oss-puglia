let currentPage = 1;
const rowsPerPage = 10000;

let originalData = [];
let filteredData = [];

fetch('candidati.json?v=' + new Date().getTime())
  .then(res => res.json())
  .then(data => {

    originalData = data;
    filteredData = data;

    // === STATISTICHE ===
    const totaleCandidati = data.length;
    const sommaPunteggi = data.reduce((acc, c) => acc + c.punteggio, 0);
    const punteggioMedio = (sommaPunteggi / totaleCandidati).toFixed(2);

    document.getElementById('totale-candidati').innerText = totaleCandidati;
    document.getElementById('punteggio-medio').innerText = punteggioMedio;

    renderTable(); // ⭐ importante
  });

// ✅ RENDER TABELLARE CON PAGINAZIONE
function renderTable() {

  const tbody = document.querySelector('tbody');
  tbody.innerHTML = "";

  const data = filteredData;

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = data.slice(start, end);

  const punteggioSoglia =
    data.length >= 4500 ? data[4499].punteggio : null;

  pageData.forEach((c, index) => {

    let esito = "";

    if (punteggioSoglia !== null) {
      esito =
        c.punteggio >= punteggioSoglia
          ? '<span class="badge ok">Dentro</span>'
          : '<span class="badge no">Fuori</span>';
    }

    let punteggioHtml = c.punteggio.toFixed(2);

    // ❤️ personalizzato
    if (c.codice === "D-29457") {
      punteggioHtml += " ❤️";
    }

    const row = document.createElement('tr');
    row.dataset.codice = c.codice.toUpperCase();

    row.innerHTML = `
      <td>${start + index + 1}</td>
      <td>${c.codice}</td>
      <td>${punteggioHtml}</td>
      <td>${c.turno}</td>
      <td>${esito}</td>
    `;

    tbody.appendChild(row);
  });

  // ✅ info pagine
  const totalePagine = Math.ceil(data.length / rowsPerPage);
  document.getElementById("page-info").innerText =
    `Pagina ${currentPage} di ${totalePagine}`;

  // ✅ disable bottoni
  document.getElementById("prev").disabled = currentPage === 1;
  document.getElementById("next").disabled = currentPage >= totalePagine;
}


// ✅ BOTTONI
document.getElementById("next").addEventListener("click", () => {
  if (currentPage * rowsPerPage < filteredData.length) {
    currentPage++;
    renderTable();
  }
});

document.getElementById("prev").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});


// ✅ RICERCA (compatibile con paginazione)
const searchInput = document.getElementById('search');

let timeout = null;

searchInput.addEventListener('input', e => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {

    const value = e.target.value.toUpperCase().trim();

    filteredData = originalData.filter(c =>
      c.codice.toUpperCase().includes(value)
    );

    currentPage = 1; // ⭐ reset pagina

    renderTable();

  }, 250);
});
