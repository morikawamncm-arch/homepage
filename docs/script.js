//----------------------------------------------------
// ページ切替（既存処理）
//----------------------------------------------------
const sections = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    sections.forEach(sec => {
      sec.style.display = (sec.id === targetId) ? 'block' : 'none';
    });
    document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
  });
});

// 初期表示：home
sections.forEach(sec => {
  sec.style.display = (sec.id === 'home') ? 'block' : 'none';
});

//----------------------------------------------------
// CSV読み込み（汎用）
//----------------------------------------------------
async function loadCSVFile(filename) {
  const res = await fetch(filename);
  let text = await res.text();

  // BOM削除
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

//----------------------------------------------------
// 複数CSV読み込み（すべて）
//----------------------------------------------------
async function loadAllPrefData() {
  const t = await loadCSVFile("tokyo.csv");
  const k = await loadCSVFile("kanagawa.csv");
  const s = await loadCSVFile("saitama.csv");
  return [...t, ...k, ...s];
}

//----------------------------------------------------
// 物件表示
//----------------------------------------------------
function renderProperties(data) {
  const container = document.getElementById('property-container');
  container.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'property-card';

    const imgSrc = item["画像"] ? `images/${item["画像"]}` : "";

    card.innerHTML = `
      <div class="property-name">${item["物件名"] || "名称未設定"}</div>
      <div class="property-price">${item["価格"] || "価格不明"}</div>
      <div class="property-img">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${item["物件名"]}" class="property-image"/>`
          : `<div style="width:150px;height:100px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#777;border-radius:4px;">画像なし</div>`
        }
      </div>
    `;

    container.appendChild(card);
  });
}

//----------------------------------------------------
// ボタン設定（CSV切替対応）
//----------------------------------------------------
function setupFilterButtons() {
  const btnContainer = document.getElementById("pref-filter");
  if (!btnContainer) return;

  const buttons = btnContainer.querySelectorAll(".filter-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", async function () {
      // active 切替
      buttons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      const pref = this.getAttribute("data-pref");

      // rent セクションへ移動
      sections.forEach(sec => {
        sec.style.display = (sec.id === "rent") ? "block" : "none";
      });
      document.getElementById("rent").scrollIntoView({ behavior: "smooth" });

      // CSV読み込み切替
      let data = [];

      if (pref === "東京") {
        data = await loadCSVFile("tokyo.csv");
      } else if (pref === "神奈川") {
        data = await loadCSVFile("kanagawa.csv");
      } else if (pref === "埼玉") {
        data = await loadCSVFile("saitama.csv");
      } else {
        // すべて表示
        data = await loadAllPrefData();
      }

      renderProperties(data);
    });
  });
}

//----------------------------------------------------
// 初期ロード（すべて表示）
//----------------------------------------------------
loadAllPrefData().then(data => {
  renderProperties(data);
  setupFilterButtons();
});
