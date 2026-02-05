const form = document.getElementById("spend-form");
const list = document.getElementById("spend-list");
const template = document.getElementById("spend-row");
const totals = document.getElementById("totals");
const todayDate = document.getElementById("today-date");
const clearAll = document.getElementById("clear-all");

const STORAGE_KEY = "daily-spendings";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);

const formatTime = (date) =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const getSpends = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const setSpends = (spends) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spends));
};

const renderTotals = (spends) => {
  totals.innerHTML = "";
  const grouped = spends.reduce((acc, spend) => {
    acc[spend.currency] = (acc[spend.currency] || 0) + spend.amount;
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) {
    const empty = document.createElement("p");
    empty.className = "spend-meta";
    empty.textContent = "No spends yet. Add your first purchase above.";
    totals.appendChild(empty);
    return;
  }

  Object.entries(grouped).forEach(([currency, amount]) => {
    const pill = document.createElement("div");
    pill.className = "total-pill";
    pill.textContent = `${amount.toFixed(2)} ${currency}`;
    totals.appendChild(pill);
  });
};

const renderList = (spends) => {
  list.innerHTML = "";
  spends
    .slice()
    .reverse()
    .forEach((spend) => {
      const row = template.content.cloneNode(true);
      row.querySelector(".spend-title").textContent = spend.title;
      row.querySelector(".spend-meta").textContent = `${spend.currency} • ${formatTime(
        new Date(spend.createdAt)
      )}`;
      row.querySelector(".spend-amount").textContent = `${spend.amount.toFixed(2)} ${
        spend.currency
      }`;
      list.appendChild(row);
    });
};

const render = () => {
  const spends = getSpends();
  renderTotals(spends);
  renderList(spends);
};

todayDate.textContent = formatDate(new Date());
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const amount = Number(data.get("amount"));
  const currency = data.get("currency");
  const title = String(data.get("title")).trim();

  if (!title || Number.isNaN(amount) || amount <= 0) {
    return;
  }

  const spends = getSpends();
  spends.push({
    id: crypto.randomUUID(),
    title,
    amount,
    currency,
    createdAt: new Date().toISOString(),
  });

  setSpends(spends);
  form.reset();
  form.elements.amount.focus();
  render();
});

clearAll.addEventListener("click", () => {
  setSpends([]);
  render();
});
