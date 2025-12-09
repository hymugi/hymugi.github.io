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

/* ----------------- 修正後的 第三層分頁 ------------------ */
function showSubSubTab(index) {
    const current = document.querySelector(".sub-content.active");

    const tabs = current.querySelectorAll(".sub-sub-tab");
    const contents = current.querySelectorAll(".sub-sub-content");

    tabs.forEach((t, i) => {
        t.classList.toggle("active", i === index);
    });

    contents.forEach((c, i) => {
        c.classList.toggle("active", i === index);
    });
}



/* -------------------------------------------------------
   自動讀 CSV → 根據 grade (SS / S / A) 自動分類
-------------------------------------------------------- */

getSkillCsvFile('skill_hitter').then(hitterList => {
    const tbodySS = document.querySelector("#hitter-SS tbody") || document.getElementById("hitter_ss");
    const tbodyS  = document.querySelector("#hitter-S tbody")|| document.getElementById("hitter_s");
    const tbodyA  = document.querySelector("#hitter-A tbody")|| document.getElementById("hitter_a");

    hitterList.forEach((hitter, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${hitter.name}</td>
            <td>${hitter.score}</td>
            <td>${hitter.grade}</td>
        `;

        // 根據 CSV 第三欄 grade 自動分流
        switch (hitter.grade.trim().toUpperCase()) {
            case "SS":
                tbodySS.appendChild(tr);
                break;
            case "S":
                tbodyS.appendChild(tr);
                break;
            case "A":
                tbodyA.appendChild(tr);
                break;
            default:
                console.warn("未分類技能：", hitter);
                break;
        }
    });
});

/* ------------------- CSV Reader --------------------- */
function getSkillCsvFile(csvfile) {
  return new Promise((resolve, reject) => {
    $.get(`doc/${csvfile}.csv`, function(csvData) {
      const lines = csvData.trim().split('\n');
      lines.shift(); // 移除標題列

      const skills = lines.map(line => {
        const [name, score, grade, comment] = line.split(',');
        return { name, score: parseFloat(score), grade, comment };
      });

      resolve(skills);
    }).fail(() => reject('無法讀取 CSV 檔案'));
  });
}


/* ------------------- 潛力計算 --------------------- */
const levels = ["D", "D+", "C", "C+", "B", "B+", "A", "A+", "S", "S+"];

const levelCost = {
    "D":  { "初階": 200, "中階": 0,   "高階": 0 },
    "D+": { "初階": 300, "中階": 450, "高階": 0 },
    "C":  { "初階": 400, "中階": 550, "高階": 0 },
    "C+": { "初階": 500, "中階": 650, "高階": 0 },
    "B":  { "初階": 0,   "中階": 750, "高階": 900 },
    "B+": { "初階": 0,   "中階": 850, "高階": 1000 },
    "A":  { "初階": 0,   "中階": 950, "高階": 1100 },
    "A+": { "初階": 0,   "中階": 1050,"高階": 1200 },
    "S":  { "初階": 0,   "中階": 1150,"高階": 1300 },
    "S+": { "初階": 0,   "中階": 1250,"高階": 1400 }
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
        low  += levelCost[lv]["初階"];
        mid  += levelCost[lv]["中階"];
        high += levelCost[lv]["高階"];
    }

    result.innerHTML = `
        初階素材需要：<b>${low}</b><br>
        中階素材需要：<b>${mid}</b><br>
        高階素材需要：<b>${high}</b>
    `;
}
