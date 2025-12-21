
// ページ切替
const sections = document.querySelectorAll(".page-section");
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    sections.forEach(sec => {
      sec.style.display = sec.id === targetId ? "block" : "none";
    });
    document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
  });
});
// 初期表示：物件ページ
sections.forEach(sec => (sec.style.display = "none"));
document.getElementById("top").style.display = "block";

// CSV読み込み
async function loadCSVFile(filename) {
  const url = `${filename}?nocache=${Date.now()}`;
  const res = await fetch(url);
  let text = await res.text();
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const lines = text.trim().split("\n");
  const header = lines[0].split(",").map(h => h.trim());
  const list = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",").map(c => c.trim());
    let item = {};
    header.forEach((h, idx) => {
      item[h] = cols[idx] || "";
    });
    list.push(item);
  }
  return list;
}

// データ読み込み（販売/賃貸＋都道府県）
let mode = "sale";
async function loadData(pref) {
  const map = {
    "東京": "tokyo",
    "神奈川": "kanagawa",
    "埼玉": "saitama"
  };
  const suffix = mode === "sale" ? "" : "_rent";
  if (pref === "all") {
    const t = await loadCSVFile(`tokyo${suffix}.csv`);
    const k = await loadCSVFile(`kanagawa${suffix}.csv`);
    const s = await loadCSVFile(`saitama${suffix}.csv`);
    return [...t, ...k, ...s];
  }
  const filename = `${map[pref]}${suffix}.csv`;
  return await loadCSVFile(filename);
}

// 物件一覧を表形式で表示
function renderProperties(data) {
  const container = document.getElementById("property-container");
  container.innerHTML = "";

  // 属性名（ヘッダー行）
  const headerRow = `
    <tr>
      <th>物件名</th>
      <th>価格</th>
      <th>場所</th>
      <th>その他</th>
      <th>画像</th>
    </tr>
  `;

  // 物件データ行
  const rows = data.map(item => `
    <tr>
      <td>${item["物件名"] || "名称未設定"}</td>
      <td>${item["価格"] || "不明"}</td>
      <td>${item["場所"] || "未記載"}</td>
      <td>${item["その他"] || "なし"}</td>
      <td>
        ${item["画像"]
          ? `<img src="images/${item["画像"]}" alt="${item["物件名"] || ""}">`
          : `<div style="width:120px;height:80px;background:#eee;display:flex;justify-content:center;align-items:center;">画像なし</div>`
        }
      </td>
    </tr>
  `).join("");

  // テーブル全体
  const table = `
    <table class="property-table">
      <thead>${headerRow}</thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  container.innerHTML = table;
}

// ボタン設定
function setupButtons() {
  const saleBtn = document.getElementById("saleBtn");
  const rentBtn = document.getElementById("rentBtn");
  const prefButtons = document.querySelectorAll(".filter-btn[data-pref]");

  async function updateList() {
    const activePref = document.querySelector(".filter-btn.active[data-pref]").dataset.pref;
    const data = await loadData(activePref);
    renderProperties(data);
  }

  saleBtn.addEventListener("click", () => {
    mode = "sale";
    saleBtn.classList.add("active");
    rentBtn.classList.remove("active");
    updateList();
  });
  rentBtn.addEventListener("click", () => {
    mode = "rent";
    rentBtn.classList.add("active");
    saleBtn.classList.remove("active");
    updateList();
  });
  prefButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      prefButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateList();
    });
  });
  // 初期表示
  updateList();
}

// 初期実行
setupButtons();
