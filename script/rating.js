const BLOB_URL = "https://jsonblob.com/api/jsonBlob/1365384020946509824";
let ratingsData = {};

document.querySelectorAll(".block").forEach(block => {
  const itemId = block.dataset.id;
  const inputs = block.querySelectorAll('input[name]');
  const summary = block.querySelector(".summary");

  inputs.forEach(input => {
    input.addEventListener("change", () => {
      const rating = +input.value;
      ratingsData[itemId] = ratingsData[itemId] || [];
      ratingsData[itemId].push(rating);
      fetch(BLOB_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingsData)
      }).then(() => {
        updateSummary(itemId, summary);
      });
    });
  });
});

function updateSummary(id, summaryEl) {
  const ratings = ratingsData[id] || [];
  const count = ratings.length;
  const avg = count ? (ratings.reduce((a, b) => a + b) / count).toFixed(1) : "0.0";
  summaryEl.innerText = `${avg} (${count})`;
}

function load() {
  fetch(BLOB_URL)
    .then(r => r.json())
    .then(data => {
      ratingsData = data;
      document.querySelectorAll(".block").forEach(block => {
        const id = block.dataset.id;
        const summary = block.querySelector(".summary");
        updateSummary(id, summary);
      });
    });
}

window.onload = load;