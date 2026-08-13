"use strict";

/* =========================
   基本設定
========================= */

const STORAGE_KEY = "timetable_app_v2";

const DAYS = ["月", "火", "水", "木", "金"];

const DEFAULT_COLORS = [
    "#FFD6D6",
    "#FFE7B8",
    "#FFF5B1",
    "#D5F5D1",
    "#CFE8FF",
    "#E5D5FF"
];


/* =========================
   データ
========================= */

function id() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

function defaultData() {

    const schedule = {
        id: id(),
        name: "時間割1",
        classes: []
    };

    return {
        schedules: [schedule],

        currentScheduleId: schedule.id,

        categories: [
            {
                id: id(),
                name: "必修"
            },
            {
                id: id(),
                name: "選択"
            },
            {
                id: id(),
                name: "専門"
            }
        ],

        colors: [...DEFAULT_COLORS]
    };
}


function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const parsed = JSON.parse(saved);

            if (
                parsed &&
                Array.isArray(parsed.schedules) &&
                Array.isArray(parsed.categories) &&
                Array.isArray(parsed.colors)
            ) {

                return parsed;
            }
        }

    } catch (e) {

        console.error("読み込みエラー:", e);
    }

    return defaultData();
}


let data = loadData();


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


function currentSchedule() {

    let schedule =
        data.schedules.find(
            s => s.id === data.currentScheduleId
        );

    if (!schedule) {

        schedule = data.schedules[0];

        data.currentScheduleId =
            schedule.id;

        saveData();
    }

    return schedule;
}


/* =========================
   DOM
========================= */

const scheduleSelect =
    document.getElementById("scheduleSelect");

const addScheduleBtn =
    document.getElementById("addScheduleBtn");

const renameScheduleBtn =
    document.getElementById("renameScheduleBtn");

const deleteScheduleBtn =
    document.getElementById("deleteScheduleBtn");

const newClassBtn =
    document.getElementById("newClassBtn");

const classModal =
    document.getElementById("classModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const saveClassBtn =
    document.getElementById("saveClassBtn");

const className =
    document.getElementById("className");

const classRoom =
    document.getElementById("classRoom");

const classTeacher =
    document.getElementById("classTeacher");

const classCredits =
    document.getElementById("classCredits");

const classCategory =
    document.getElementById("classCategory");

const classColor =
    document.getElementById("classColor");

const slotGrid =
    document.getElementById("slotGrid");

const categoryList =
    document.getElementById("categoryList");

const addCategoryBtn =
    document.getElementById("addCategoryBtn");

const categoryModal =
    document.getElementById("categoryModal");

const closeCategoryBtn =
    document.getElementById("closeCategoryBtn");

const cancelCategoryBtn =
    document.getElementById("cancelCategoryBtn");

const saveCategoryBtn =
    document.getElementById("saveCategoryBtn");

const categoryName =
    document.getElementById("categoryName");

const newColor =
    document.getElementById("newColor");

const addColorBtn =
    document.getElementById("addColorBtn");

const customColors =
    document.getElementById("customColors");


let editingClassId = null;


/* =========================
   安全チェック
========================= */

function checkDOM() {

    const required = [
        scheduleSelect,
        addScheduleBtn,
        newClassBtn,
        classModal,
        saveClassBtn,
        className,
        classCredits,
        classCategory,
        classColor,
        slotGrid
    ];

    return required.every(x => x !== null);
}


if (!checkDOM()) {

    alert(
        "HTMLとJavaScriptの組み合わせが違います。"
    );

    throw new Error(
        "必要なHTML要素がありません"
    );
}


/* =========================
   時間割一覧
========================= */

function renderSchedules() {

    scheduleSelect.innerHTML = "";

    data.schedules.forEach(schedule => {

        const option =
            document.createElement("option");

        option.value = schedule.id;

        option.textContent =
            schedule.name;

        if (
            schedule.id ===
            data.currentScheduleId
        ) {
            option.selected = true;
        }

        scheduleSelect.appendChild(option);
    });
}


/* =========================
   時間割表示
========================= */

function renderTimetable() {

    const schedule =
        currentSchedule();

    document
        .querySelectorAll(".cell")
        .forEach(cell => {

            cell.innerHTML = "";

            const day =
                Number(cell.dataset.day);

            const period =
                Number(cell.dataset.period);

            const classes =
                schedule.classes.filter(cls =>
                    cls.slots.some(slot =>
                        slot.day === day &&
                        slot.period === period
                    )
                );

            classes.forEach(cls => {

                const card =
                    document.createElement("div");

                card.className =
                    "class-card";

                card.style.backgroundColor =
                    cls.color || "#eeeeee";

                const title =
                    document.createElement("div");

                title.className =
                    "class-name";

                title.textContent =
                    cls.name;

                card.appendChild(title);


                if (cls.category) {

                    const category =
                        document.createElement("div");

                    category.className =
                        "class-category";

                    category.textContent =
                        cls.category;

                    card.appendChild(category);
                }


                const info =
                    document.createElement("div");

                info.className =
                    "class-info";

                const text = [];

                if (cls.credits > 0) {
                    text.push(
                        cls.credits + "単位"
                    );
                }

                if (cls.room) {
                    text.push(cls.room);
                }

                info.textContent =
                    text.join(" / ");

                card.appendChild(info);


                card.addEventListener(
                    "click",
                    function(e) {

                        e.stopPropagation();

                        openEditClass(cls.id);
                    }
                );


                cell.appendChild(card);
            });
        });
}


/* =========================
   科目群
========================= */

function renderCategories(selected = "") {

    classCategory.innerHTML = "";

    data.categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.name;

        if (
            category.name === selected
        ) {
            option.selected = true;
        }

        classCategory.appendChild(option);
    });


    categoryList.innerHTML = "";

    data.categories.forEach(category => {

        const row =
            document.createElement("div");

        row.className =
            "category-item";


        const name =
            document.createElement("span");

        name.className =
            "category-name";

        name.textContent =
            category.name;


        const button =
            document.createElement("button");

        button.textContent = "削除";

        button.addEventListener(
            "click",
            function() {

                if (
                    data.categories.length <= 1
                ) {

                    alert(
                        "科目群は最低1つ必要です。"
                    );

                    return;
                }


                if (
                    !confirm(
                        "「" +
                        category.name +
                        "」を削除しますか？"
                    )
                ) {
                    return;
                }


                data.categories =
                    data.categories.filter(
                        c =>
                            c.id !== category.id
                    );

                saveData();

                renderCategories();
            }
        );


        row.appendChild(name);
        row.appendChild(button);

        categoryList.appendChild(row);
    });
}


/* =========================
   色
========================= */

function renderColors(selected = "") {

    classColor.innerHTML = "";

    data.colors.forEach(color => {

        const option =
            document.createElement("option");

        option.value = color;

        option.textContent = color;

        if (color === selected) {
            option.selected = true;
        }

        classColor.appendChild(option);
    });


    if (customColors) {

        customColors.innerHTML = "";

        data.colors.forEach(color => {

            const row =
                document.createElement("div");

            row.style.marginBottom = "5px";


            const preview =
                document.createElement("span");

            preview.className =
                "color-preview";

            preview.style.backgroundColor =
                color;


            const text =
                document.createElement("span");

            text.textContent = color;


            row.appendChild(preview);
            row.appendChild(text);

            customColors.appendChild(row);
        });
    }
}


/* =========================
   コマ選択
========================= */

function renderSlots(selected = []) {

    slotGrid.innerHTML = "";


    // 左上
    slotGrid.appendChild(
        document.createElement("div")
    );


    // 曜日
    DAYS.forEach(day => {

        const div =
            document.createElement("div");

        div.className =
            "slot-day";

        div.textContent =
            day;

        slotGrid.appendChild(div);
    });


    // 1〜5限
    for (
        let period = 1;
        period <= 5;
        period++
    ) {

        const periodDiv =
            document.createElement("div");

        periodDiv.className =
            "slot-period";

        periodDiv.textContent =
            period + "限";

        slotGrid.appendChild(periodDiv);


        for (
            let day = 0;
            day < 5;
            day++
        ) {

            const label =
                document.createElement("label");

            label.className =
                "slot-checkbox";


            const checkbox =
                document.createElement("input");

            checkbox.type =
                "checkbox";

            checkbox.dataset.day =
                day;

            checkbox.dataset.period =
                period;


            const checked =
                selected.some(slot =>
                    Number(slot.day) === day &&
                    Number(slot.period) === period
                );

            checkbox.checked =
                checked;


            label.appendChild(checkbox);

            slotGrid.appendChild(label);
        }
    }
}


/* =========================
   選択コマ取得
========================= */

function getSelectedSlots() {

    const slots = [];

    const checkboxes =
        slotGrid.querySelectorAll(
            "input[type='checkbox']"
        );

    checkboxes.forEach(checkbox => {

        if (checkbox.checked) {

            slots.push({

                day:
                    Number(
                        checkbox.dataset.day
                    ),

                period:
                    Number(
                        checkbox.dataset.period
                    )
            });
        }
    });

    return slots;
}


/* =========================
   授業追加
========================= */

function openNewClass() {

    editingClassId = null;

    document.getElementById(
        "modalTitle"
    ).textContent = "授業を追加";


    className.value = "";

    classRoom.value = "";

    classTeacher.value = "";

    classCredits.value = "2";


    renderCategories();

    renderColors(
        data.colors[0]
    );

    renderSlots([]);


    addDeleteButton();


    classModal.classList.remove(
        "hidden"
    );
}


/* =========================
   授業編集
========================= */

function openEditClass(classId) {

    const schedule =
        currentSchedule();

    const cls =
        schedule.classes.find(
            c => c.id === classId
        );

    if (!cls) {
        return;
    }


    editingClassId =
        classId;


    document.getElementById(
        "modalTitle"
    ).textContent = "授業を編集";


    className.value =
        cls.name || "";

    classRoom.value =
        cls.room || "";

    classTeacher.value =
        cls.teacher || "";

    classCredits.value =
        cls.credits || 0;


    renderCategories(
        cls.category || ""
    );

    renderColors(
        cls.color || data.colors[0]
    );

    renderSlots(
        cls.slots || []
    );


    addDeleteButton();


    classModal.classList.remove(
        "hidden"
    );
}


/* =========================
   授業保存
========================= */

function saveClass() {

    const name =
        className.value.trim();

    if (!name) {

        alert(
            "授業名を入力してください。"
        );

        return;
    }


    const slots =
        getSelectedSlots();

    if (slots.length === 0) {

        alert(
            "コマを1つ以上選択してください。"
        );

        return;
    }


    const schedule =
        currentSchedule();


    const categoryIndex =
        classCategory.selectedIndex;


    let category = "";

    if (
        categoryIndex >= 0 &&
        classCategory.options[categoryIndex]
    ) {

        category =
            classCategory
                .options[categoryIndex]
                .textContent;
    }


    const newClass = {

        id:
            editingClassId || id(),

        name: name,

        room:
            classRoom.value.trim(),

        teacher:
            classTeacher.value.trim(),

        credits:
            Number(classCredits.value) || 0,

        category: category,

        color:
            classColor.value,

        slots: slots
    };


    if (editingClassId) {

        const index =
            schedule.classes.findIndex(
                c =>
                    c.id === editingClassId
            );

        if (index !== -1) {

            schedule.classes[index] =
                newClass;
        }

    } else {

        schedule.classes.push(
            newClass
        );
    }


    saveData();

    renderTimetable();

    closeClassModal();
}


/* =========================
   授業削除
========================= */

function deleteCurrentClass() {

    if (!editingClassId) {
        return;
    }


    const schedule =
        currentSchedule();


    const cls =
        schedule.classes.find(
            c =>
                c.id === editingClassId
        );


    if (!cls) {
        return;
    }


    if (
        !confirm(
            "「" +
            cls.name +
            "」を削除しますか？"
        )
    ) {
        return;
    }


    schedule.classes =
        schedule.classes.filter(
            c =>
                c.id !== editingClassId
        );


    saveData();

    renderTimetable();

    closeClassModal();
}


/* =========================
   削除ボタン
========================= */

function addDeleteButton() {

    let button =
        document.getElementById(
            "deleteClassBtn"
        );


    if (!button) {

        button =
            document.createElement("button");

        button.id =
            "deleteClassBtn";

        button.textContent =
            "授業を削除";

        button.style.background =
            "#ffe0e0";

        button.style.color =
            "#b00000";


        const buttons =
            document.querySelector(
                "#classModal .modal-buttons"
            );


        if (buttons) {

            buttons.insertBefore(
                button,
                saveClassBtn
            );
        }


        button.addEventListener(
            "click",
            deleteCurrentClass
        );
    }


    button.style.display =
        editingClassId
            ? "block"
            : "none";
}


/* =========================
   モーダル
========================= */

function closeClassModal() {

    classModal.classList.add(
        "hidden"
    );

    editingClassId = null;
}


function openCategoryModal() {

    categoryName.value = "";

    categoryModal.classList.remove(
        "hidden"
    );
}


function closeCategoryModal() {

    categoryModal.classList.add(
        "hidden"
    );
}


/* =========================
   科目群追加
========================= */

function saveCategory() {

    const name =
        categoryName.value.trim();

    if (!name) {

        alert(
            "科目群名を入力してください。"
        );

        return;
    }


    data.categories.push({

        id: id(),

        name: name
    });


    saveData();

    renderCategories();

    closeCategoryModal();
}


/* =========================
   色追加
========================= */

function addNewColor() {

    if (!newColor) {
        return;
    }


    const color =
        newColor.value;


    if (
        data.colors.includes(color)
    ) {

        alert(
            "その色はすでに登録されています。"
        );

        return;
    }


    data.colors.push(color);

    saveData();

    renderColors(color);
}


/* =========================
   時間割追加
========================= */

function addSchedule() {

    const name =
        prompt(
            "時間割の名前",
            "時間割" +
            (data.schedules.length + 1)
        );


    if (
        !name ||
        !name.trim()
    ) {
        return;
    }


    const schedule = {

        id: id(),

        name:
            name.trim(),

        classes: []
    };


    data.schedules.push(
        schedule
    );


    data.currentScheduleId =
        schedule.id;


    saveData();

    renderAll();
}


/* =========================
   時間割名前変更
========================= */

function renameSchedule() {

    const schedule =
        currentSchedule();


    const name =
        prompt(
            "時間割の名前",
            schedule.name
        );


    if (
        !name ||
        !name.trim()
    ) {
        return;
    }


    schedule.name =
        name.trim();


    saveData();

    renderSchedules();
}


/* =========================
   時間割削除
========================= */

function deleteSchedule() {

    if (
        data.schedules.length <= 1
    ) {

        alert(
            "時間割は最低1つ必要です。"
        );

        return;
    }


    const schedule =
        currentSchedule();


    if (
        !confirm(
            "「" +
            schedule.name +
            "」を削除しますか？"
        )
    ) {
        return;
    }


    data.schedules =
        data.schedules.filter(
            s =>
                s.id !== schedule.id
        );


    data.currentScheduleId =
        data.schedules[0].id;


    saveData();

    renderAll();
}


/* =========================
   イベント
========================= */

scheduleSelect.addEventListener(
    "change",
    function() {

        data.currentScheduleId =
            this.value;

        saveData();

        renderTimetable();
    }
);


addScheduleBtn.addEventListener(
    "click",
    addSchedule
);


renameScheduleBtn.addEventListener(
    "click",
    renameSchedule
);


deleteScheduleBtn.addEventListener(
    "click",
    deleteSchedule
);


newClassBtn.addEventListener(
    "click",
    openNewClass
);


closeModalBtn.addEventListener(
    "click",
    closeClassModal
);


cancelBtn.addEventListener(
    "click",
    closeClassModal
);


saveClassBtn.addEventListener(
    "click",
    saveClass
);


addCategoryBtn.addEventListener(
    "click",
    openCategoryModal
);


closeCategoryBtn.addEventListener(
    "click",
    closeCategoryModal
);


cancelCategoryBtn.addEventListener(
    "click",
    closeCategoryModal
);


saveCategoryBtn.addEventListener(
    "click",
    saveCategory
);


addColorBtn.addEventListener(
    "click",
    addNewColor
);


/* =========================
   モーダル外クリック
========================= */

classModal.addEventListener(
    "click",
    function(e) {

        if (
            e.target === classModal
        ) {
            closeClassModal();
        }
    }
);


categoryModal.addEventListener(
    "click",
    function(e) {

        if (
            e.target === categoryModal
        ) {
            closeCategoryModal();
        }
    }
);


/* =========================
   全体描画
========================= */

function renderAll() {

    currentSchedule();

    renderSchedules();

    renderTimetable();

    renderCategories();

    renderColors();
}


/* =========================
   起動
========================= */

renderAll();
