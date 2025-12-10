var nowSkills = []
var nowSkillsLevel = []

function showTab(index) {
    document.querySelectorAll(".tab").forEach((t, i) => {
        t.classList.toggle("active", i === index);
    });
    document.querySelectorAll(".content").forEach((c, i) => {
        c.classList.toggle("active", i === index);
    });

    if (index == 1) {
        $(".sub-tab").first().trigger("click");
    }
}

function showSubTab(self,csvfile) {
    document.querySelectorAll(".sub-tab").forEach((t, i) => {
        t.classList.toggle("active", i === index);
    });
    document.querySelectorAll(".sub-content").forEach((c, i) => {
        c.classList.toggle("active", i === index);
    });
}

function selectSkillTab(self,csvfile) {
    $(".sub-tab").removeClass("active");
    $(self).addClass("active");
    nowSkills = [];
    nowSkillsLevel = [];

    loadCSVData(csvfile).then(() => {
        renderLevelTabs()
    });
}

function renderLevelTabs() {
  const $container = $("#levels");
  $container.empty(); // 清空原本內容

  const $tab = $("<div>")
    .addClass("sub-sub-tab")
    .text('All')
    .attr("data-index", -1)
    .on("click", function() {
        filterSkills(this, 'All');
    });
    $container.append($tab);

  nowSkillsLevel.forEach((level, index) => {
    const $tab = $("<div>")
    .addClass("sub-sub-tab")
    .text(level)
    .attr("data-index", index)
    .on("click", function() {
        filterSkills(this, level);
    });
    $container.append($tab);
  });
  $(".sub-sub-tab").first().trigger("click");
}


function loadCSVData(csvfile) {
    return $.get(`doc/${csvfile}.csv`).then(csvData => {
        const lines = csvData.trim().split('\n');
        lines.shift();

        const skills = lines.map(line => {
            const [name, score, grade, comment] = line.split(',');
            return { name, score: parseFloat(score), grade, comment };
        });

        nowSkills = skills.map(s => ({
            name: s.name,
            score: s.score,
            grade: s.grade
        }));

        nowSkillsLevel = [...new Set(skills.map(s => s.grade))];
    });
}

function filterSkills(self,skill) {
    $(".sub-sub-tab").removeClass("active");
    $(self).addClass("active");
    const $tbody = $("#skills");
    $tbody.empty();
    // 1️⃣ 篩出符合等級的技能
    if (skill == 'All') {
        nowSkills.forEach((item, index) => {
            const $row = $("<tr>");
            $row.append($("<td>").text(index + 1));     // 序號
            $row.append($("<td>").text(item.name));     // 技能
            $row.append($("<td>").text(item.score));    // 評分
            $row.append($("<td>").text(item.grade));    // 等級
            $tbody.append($row);
        });
    } else {
        const filtered = nowSkills.filter(s => s.grade === skill);
        filtered.forEach((item, index) => {
            const $row = $("<tr>");
            $row.append($("<td>").text(index + 1));     // 序號
            $row.append($("<td>").text(item.name));     // 技能
            $row.append($("<td>").text(item.score));    // 評分
            $row.append($("<td>").text(item.grade));    // 等級
            $tbody.append($row);
        });
    }
    
}

/*async function loadSkillData(filename, prefix) {
    try {
        const response = await fetch(`doc/${filename}.csv`);
        const csvData = await response.text();
        
        const lines = csvData.trim().split('\n');
        lines.shift(); // 移除標題列

        const skills = {
            SS: [],
            S: [],
            A: []
        };

        lines.forEach(line => {
            const [name, score, grade, comment] = line.split(',');
            const gradeUpper = grade.trim().toUpperCase();
            
            if (skills[gradeUpper]) {
                skills[gradeUpper].push({
                    name: name.trim(),
                    score: parseFloat(score),
                    grade: gradeUpper,
                    comment: comment ? comment.trim() : ''
                });
            }
        });

        ['SS', 'S', 'A'].forEach(gradeLevel => {
            const tbody = document.getElementById(`${prefix}_${gradeLevel.toLowerCase()}`);
            if (tbody) {
                skills[gradeLevel].forEach((skill, index) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${skill.name}</td>
                        <td>${skill.score}</td>
                        <td>${skill.grade}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        });

    } catch (error) {
        console.error(`無法讀取 ${filename}.csv:`, error);
    }
}*/

// 載入所有 CSV 資料
/*loadSkillData('skill_hitter', 'hitter');    // 打者
loadSkillData('skill_pitcher_starting', 'pitcher');   // 投手
loadSkillData('skill_pitcher_relief', 'bullpen');   // 牛棚*/
//loadSkillData('D', 'hof');       // HOF

// 潛力計算機
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

    for (let i = idxC; i <= idxM; i++) {
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
