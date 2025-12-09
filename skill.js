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

function showSubSubTab(index) {
    const current = document.querySelector(".sub-content.active");
    const tabs = current.querySelectorAll(".sub-sub-tab");
    const contents = current.querySelectorAll(".sub-sub-content");

    tabs.forEach((t, i) => t.classList.toggle("active", i === index));
    contents.forEach((c, i) => c.classList.toggle("active", i === index));
}

/* ------------------- CSV 讀取並分類 ------------------- */
const csvMap = {
    "hitter": "skill_hitter.csv",
    "pitcher": "skill_pitcher_starting.csv",
    "bullpen": "skill_pitcher_relief.csv",
    "hof": "D.csv"
};

function loadSkills(role) {
    getSkillCsvFile(csvMap[role]).then(list => {
        const tbodySS = document.getElementById(`${role}_ss`);
        const tbodyS  = document.getElementById(`${role}_s`);
        const tbodyA  = document.getElementById(`${role}_a`);

        // 清空原本表格
        [tbodySS, tbodyS, tbodyA].forEach(tbody => tbody.innerHTML = "");

        list.forEach((item, idx) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${item.name}</td>
                <td>${item.score}</td>
                <td>${item.grade}</td>
            `;

            switch (item.grade.trim().toUpperCase()) {
                case "SS": tbodySS.appendChild(tr); break;
                case "S":  tbodyS.appendChild(tr); break;
                case "A":  tbodyA.appendChild(tr); break;
                default: console.warn("未分類技能：", item); break;
            }
        });
    }).catch(err => console.error(err));
}

function getSkillCsvFile(csvfile) {
    return new Promise((resolve, reject) => {
        $.get(`doc/${csvfile}`, function(csvData) {
            const lines = csvData.trim().split('\n');
            lines.shift(); // 移除標題
            const skills = lines.map(line => {
                const [name, score, grade, comment] = line.split(',');
                return { name, score: parseFloat(score), grade, comment };
            });
            resolve(skills);
        }).fail(() => reject(`無法讀取 CSV 檔案: ${csvfile}`));
    });
}

/* ------------------- 初始化，載入所有分頁 ------------------- */
["hitter", "pitcher", "bullpen", "hof"].forEach(role => loadSkills(role));

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
