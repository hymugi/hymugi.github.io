function showTab(index) {
    document.querySelectorAll(".tab").forEach((t, i) => {
        t.classList.toggle("active", i === index);
    });
    document.querySelectorAll(".content").forEach((c, i) => {
        c.classList.toggle("active", i === index);
    });
}
function showSubTab(index) {
    document.querySelectorAll(".sub-tab").forEach((t, i) => {
        t.classList.toggle("active", i === index);
    });
    document.querySelectorAll(".sub-content").forEach((c, i) => {
        c.classList.toggle("active", i === index);
    });
}
function showSubSubTab(index, type) {
    const contents = document.querySelectorAll(`#${type}-SS, #${type}-S, #${type}-A`);
    const tabs = document.querySelectorAll(`.sub-sub-tabs div`);

    contents.forEach(c => c.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));

    contents[index].classList.add('active');
    tabs[index].classList.add('active');
}

getSkillCsvFile('skill_hitter').then(hitter => {
  console.log(hitter); // ✅ 拿到轉換後的陣列
});

const hitter = [
    { name: "核心主導者", score: 33, grade: "SS" },
    { name: "領導者", score: 27, grade: "SS" },
    { name: "中央打線", score: 24, grade: "SS" },
    { name: "客場戰神", score: 22.8, grade: "SS" },
    { name: "疊加", score: 24, grade: "SS" },
    { name: "超速節奏", score: 23.2, grade: "SS" },
    { name: "旋風主角", score: 22, grade: "S" },
    { name: "打擊機器", score: 21, grade: "S" },
    { name: "主場英雄", score: 20.9, grade: "S" },
    { name: "挑戰精神", score: 20, grade: "S" },
    { name: "挑戰者", score: 20, grade: "S" },
    { name: "排名競爭", score: 19, grade: "A" },
    { name: "五項全能", score: 15, grade: "A" },
    { name: "強力打者", score: 18.7, grade: "A" },
    { name: "下位打線", score: 18.5, grade: "A" },
    { name: "經驗豐富", score: 18.4, grade: "A" },
    { name: "主場優勢", score: 18.4, grade: "A" },
    { name: "接觸型打者", score: 16.5, grade: "A" },
    { name: "最佳球員", score: 16, grade: "A" },
];
const tbody = document.getElementById("hitter");
hitter.forEach((hitter, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${hitter.name}</td>
        <td>${hitter.score}</td>
        <td>${hitter.grade}</td>
    `;
    tbody.appendChild(tr);
});
const levels = ["D", "D+", "C", "C+", "B", "B+", "A", "A+", "S", "S+"];

const levelCost = {
    "D": { "初階": 200, "中階": 0, "高階": 0 },
    "D+": { "初階": 300, "中階": 450, "高階": 0 },
    "C": { "初階": 400, "中階": 550, "高階": 0 },
    "C+": { "初階": 500, "中階": 650, "高階": 0 },
    "B": { "初階": 0, "中階": 750, "高階": 900 },
    "B+": { "初階": 0, "中階": 850, "高階": 1000 },
    "A": { "初階": 0, "中階": 950, "高階": 1100 },
    "A+": { "初階": 0, "中階": 1050, "高階": 1200 },
    "S": { "初階": 0, "中階": 1150, "高階": 1300 },
    "S+": { "初階": 0, "中階": 1250, "高階": 1400 },
};

function initSelect() {
    const current = document.getElementById("currentLevel");
    const max = document.getElementById("maxLevel");

    levels.forEach(lv => {
        current.innerHTML += `<option value="${lv}">${lv}</option>`;
        max.innerHTML += `<option value="${lv}">${lv}</option>`;
    });
}
initSelect();

function calcCost() {
    const c = document.getElementById("currentLevel").value;
    const m = document.getElementById("maxLevel").value;
    const result = document.getElementById("result");

    if (!c || !m) {
        result.innerHTML = "請選擇兩個等級";
        return;
    }

    const idxC = levels.indexOf(c);
    const idxM = levels.indexOf(m);

    if (idxM <= idxC) {
        result.innerHTML = "最高等級必須大於目前等級";
        return;
    }

    let low = 0, mid = 0, high = 0;

    for (let i = idxC + 1; i <= idxM; i++) {
        const lv = levels[i];
        low += levelCost[lv]["初階"];
        mid += levelCost[lv]["中階"];
        high += levelCost[lv]["高階"];
    }

    result.innerHTML = `
        初階素材需要：<b>${low}</b><br>
        中階素材需要：<b>${mid}</b><br>
        高階素材需要：<b>${high}</b>
    `;
}

function getSkillCsvFile(csvfile) {
  return new Promise((resolve, reject) => {
    $.get(`doc/${csvfile}.csv`, function(csvData) {
      const lines = csvData.trim().split('\n');
      lines.shift();

      const hitter = lines.map(line => {
        const [name, score, grade, comment] = line.split(',');
        return { name, score: parseFloat(score), grade, comment };
      });

      resolve(hitter);
    }).fail(() => reject('無法讀取 CSV 檔案'));
  });
}
