/* =========================================
   データ
========================================= */

const STORAGE_KEY = "my_timetable_app_v1";

const DAYS = ["月", "火", "水", "木", "金"];

let data = loadData();

let currentScheduleId = data.currentScheduleId;

let editingClassId = null;


/* =========================================
   初期データ
========================================= */

function createInitialData() {

    const defaultSchedule = {
        id: createId(),
        name: "時間割1",
        classes: []
    };

    return {

        schedules: [defaultSchedule],

        currentScheduleId: defaultSchedule.id,

        categories: [
            {
                id: createId(),
                name: "必修"
            },
            {
                id: createId(),
                name: "選択"
            },
            {
                id: createId(),
                name: "専門"
            }
        ],

        colors: [
            "#FFD6D6",
            "#FFE7B8",
            "#FFF5B1",
            "#D5F5D1",
            "#CFE8FF",
            "#E5D5FF"
        ]
    };
}


/* =========================================
   保存・読み込み
========================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const parsed = JSON.parse(saved);

            if (
                parsed.schedules &&
                parsed.categories &&
                parsed.colors
            ) {
                return parsed;
            }
        }

    } catch (error) {

        console.error(error);
    }

    return createInitialData();
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/* =========================================
   ID
========================================= */

function createId() {

    return Date.now().toString(36)
        + Math.random().toString(36).substring(2);
}


/* =========================================
   現在の時間割
========================================= */

function getCurrentSchedule() {

    return data.schedules.find(
        schedule =>
            schedule.id === currentScheduleId
    );
}


/* =========================================
   DOM
========================================= */

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


/* =========================================
   時間割セレクト
========================================= */

function renderScheduleSelect() {

    scheduleSelect.innerHTML = "";

    data.schedules.forEach(schedule => {

        const option =
            document.createElement("option");

        option.value = schedule.id;

        option.textContent = schedule.name;

        if (schedule.id === currentScheduleId) {
            option.selected = true;
        }

        scheduleSelect.appendChild(option);
    });
}


/* =========================================
   時間割描画
========================================= */

function renderTimetable() {

    const schedule =
        getCurrentSchedule();

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
                    createClassCard(cls);

                cell.appendChild(card);
            });
        });
}


/* =========================================
   授業カード
========================================= */

function createClassCard(cls) {

    const card =
        document.createElement("div");

    card.className = "class-card";

    card.style.backgroundColor =
        cls.color;

    const name =
        document.createElement("div");

    name.className = "class-name";

    name.textContent =
        cls.name;

    card.appendChild(name);


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

    const details = [];

    if (cls.credits) {
        details.push(`${cls.credits}単位`);
    }

    if (cls.room) {
        details.push(cls.room);
    }

    if (cls.teacher) {
        details.push(cls.teacher);
    }

    info.textContent =
        details.join(" / ");

    card.appendChild(info);


    card.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openEditClass(cls.id);
        }
    );


    return card;
}


/* =========================================
   授業追加画面
========================================= */

function openNewClass() {

    editingClassId = null;

    document.getElementById("modalTitle")
        .textContent = "授業を追加";

    className.value = "";
    classRoom.value = "";
    classTeacher.value = "";
    classCredits.value = "2";

    renderCategories();
    renderColors();
    renderSlots([]);

    classModal.classList.remove("hidden");
}


/* =========================================
   授業編集
========================================= */

function openEditClass(id) {

    const schedule =
        getCurrentSchedule();

    const cls =
        schedule.classes.find(
            item => item.id === id
        );

    if (!cls) return;

    editingClassId = id;

    document.getElementById("modalTitle")
        .textContent = "授業を編集";

    className.value =
        cls.name;

    classRoom.value =
        cls.room || "";

    classTeacher.value =
        cls.teacher || "";

    classCredits.value =
        cls.credits || 0;

    renderCategories(cls.category);
    renderColors(cls.color);
    renderSlots(cls.slots);

    classModal.classList.remove("hidden");
}


/* =========================================
   コマ選択
========================================= */

function renderSlots(selectedSlots) {

    slotGrid.innerHTML = "";


    // 左上
    const empty =
        document.createElement("div");

    slotGrid.appendChild(empty);


    // 曜日
    DAYS.forEach(day => {

        const element =
            document.createElement("div");

        element.className =
            "slot-day";

        element.textContent =
            day;

        slotGrid.appendChild(element);
    });


    // 1〜5限
    for (
        let period = 1;
        period <= 5;
        period++
    ) {

        const periodElement =
            document.createElement("div");

        periodElement.className =
            "slot-period";

        periodElement.textContent =
            `${period}限`;

        slotGrid.appendChild(periodElement);


        for (
            let day = 0;
            day < 5;
            day++
        ) {

            const wrapper =
                document.createElement("label");

            wrapper.className =
                "slot-checkbox";


            const checkbox =
                document.createElement("input");

            checkbox.type =
                "checkbox";

            checkbox.dataset.day =
                day;

            checkbox.dataset.period =
                period;


            const exists =
                selectedSlots.some(slot =>
                    slot.day === day &&
                    slot.period === period
                );

            checkbox.checked =
                exists;


            wrapper.appendChild(checkbox);

            slotGrid.appendChild(wrapper);
        }
    }
}


/* =========================================
   選択されたコマ取得
========================================= */

function getSelectedSlots() {

    const checkboxes =
        slotGrid.querySelectorAll(
            "input[type='checkbox']"
        );

    const slots = [];

    checkboxes.forEach(checkbox => {

        if (checkbox.checked) {

            slots.push({
                day: Number(
                    checkbox.dataset.day
                ),

                period: Number(
                    checkbox.dataset.period
                )
            });
        }
    });

    return slots;
}


/* =========================================
   授業保存
========================================= */

function saveClass() {

    const name =
        className.value.trim();

    if (!name) {

        alert("授業名を入力してください。");

        return;
    }


    const slots =
        getSelectedSlots();

    if (slots.length === 0) {

        alert("少なくとも1つコマを選択してください。");

        return;
    }


    const schedule =
        getCurrentSchedule();


    const categoryOption =
        classCategory.options[
            classCategory.selectedIndex
        ];


    const clsData = {

        id: editingClassId || createId(),

        name: name,

        room:
            classRoom.value.trim(),

        teacher:
            classTeacher.value.trim(),

        credits:
            Number(classCredits.value) || 0,

        category:
            categoryOption
                ? categoryOption.textContent
                : "",

        color:
            classColor.value,

        slots:
            slots
    };


    /* =====================================
       既存授業を編集
    ===================================== */

    if (editingClassId) {

        const index =
            schedule.classes.findIndex(
                cls =>
                    cls.id === editingClassId
            );

        if (index !== -1) {

            schedule.classes[index] =
                clsData;
        }

    }

    /* =====================================
       新規授業
    ===================================== */

    else {

        schedule.classes.push(
            clsData
        );
    }


    saveData();

    renderTimetable();

    closeClassModal();
}


/* =========================================
   授業削除
========================================= */

function deleteClass(id) {

    const schedule =
        getCurrentSchedule();

    const cls =
        schedule.classes.find(
            item => item.id === id
        );

    if (!cls) return;


    const result =
        confirm(
            `「${cls.name}」を削除しますか？`
        );

    if (!result) return;


    schedule.classes =
        schedule.classes.filter(
            item => item.id !== id
        );

    saveData();

    renderTimetable();

    closeClassModal();
}


/* =========================================
   モーダルを閉じる
========================================= */

function closeClassModal() {

    classModal.classList.add(
        "hidden"
    );

    editingClassId = null;
}


/* =========================================
   科目群
========================================= */

function renderCategories(selectedName = "") {

    classCategory.innerHTML = "";

    data.categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.name;

        if (
            category.name === selectedName
        ) {
            option.selected = true;
        }

        classCategory.appendChild(option);
    });


    categoryList.innerHTML = "";


    data.categories.forEach(category => {

        const item =
            document.createElement("div");

        item.className =
            "category-item";


        const name =
            document.createElement("span");

        name.className =
            "category-name";

        name.textContent =
            category.name;


        const deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "削除";


        deleteButton.addEventListener(
            "click",
            () => {

                if (
                    data.categories.length <= 1
                ) {

                    alert(
                        "科目群は最低1つ必要です。"
                    );

                    return;
                }


                const result =
                    confirm(
                        `「${category.name}」を削除しますか？`
                    );

                if (!result) return;


                data.categories =
                    data.categories.filter(
                        item =>
                            item.id !== category.id
                    );


                saveData();

                renderCategories();

            }
        );


        item.appendChild(name);
        item.appendChild(deleteButton);

        categoryList.appendChild(item);
    });
}


/* =========================================
   科目群追加
========================================= */

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


function saveCategory() {

    const name =
        categoryName.value.trim();

    if (!name) {

        alert("科目群名を入力してください。");

        return;
    }


    data.categories.push({

        id: createId(),

        name: name

    });


    saveData();

    renderCategories();

    closeCategoryModal();
}


/* =========================================
   色
========================================= */

function renderColors(selectedColor = "") {

    classColor.innerHTML = "";

    data.colors.forEach(color => {

        const option =
            document.createElement("option");

        option.value = color;

        option.textContent = color;

        if (color === selectedColor) {

            option.selected = true;
        }

        classColor.appendChild(option);
    });


    customColors.innerHTML = "";


    data.colors.forEach(color => {

        const row =
            document.createElement("div");

        row.style.marginBottom =
            "5px";


        const preview =
            document.createElement("span");

        preview.className =
            "color-preview";

        preview.style.background =
            color;


        const text =
            document.createElement("span");

        text.textContent =
            color;


        row.appendChild(preview);
        row.appendChild(text);


        customColors.appendChild(row);
    });
}


/* =========================================
   色追加
========================================= */

function addNewColor() {

    const color =
        newColor.value;


    if (
        data.colors.includes(color)
    ) {

        alert("その色はすでにあります。");

        return;
    }


    data.colors.push(color);

    saveData();

    renderColors(color);
}


/* =========================================
   時間割追加
========================================= */

function addSchedule() {

    const name =
        prompt(
            "新しい時間割の名前を入力してください。",
            `時間割${data.schedules.length + 1}`
        );

    if (!name) return;


    const schedule = {

        id: createId(),

        name: name,

        classes: []

    };


    data.schedules.push(
        schedule
    );

    currentScheduleId =
        schedule.id;

    data.currentScheduleId =
        currentScheduleId;


    saveData();

    renderAll();
}


/* =========================================
   時間割名前変更
========================================= */

function renameSchedule() {

    const schedule =
        getCurrentSchedule();

    if (!schedule) return;


    const name =
        prompt(
            "時間割の名前",
            schedule.name
        );

    if (!name) return;


    schedule.name =
        name.trim();

    saveData();

    renderScheduleSelect();
}


/* =========================================
   時間割削除
========================================= */

function deleteSchedule() {

    if (data.schedules.length <= 1) {

        alert(
            "時間割は最低1つ必要です。"
        );

        return;
    }


    const schedule =
        getCurrentSchedule();

    const result =
        confirm(
            `「${schedule.name}」を削除しますか？`
        );

    if (!result) return;


    data.schedules =
        data.schedules.filter(
            item =>
                item.id !== schedule.id
        );


    currentScheduleId =
        data.schedules[0].id;

    data.currentScheduleId =
        currentScheduleId;


    saveData();

    renderAll();
}


/* =========================================
   イベント
========================================= */

scheduleSelect.addEventListener(
    "change",
    () => {

        currentScheduleId =
            scheduleSelect.value;

        data.currentScheduleId =
            currentScheduleId;

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


/* =========================================
   モーダル外クリック
========================================= */

classModal.addEventListener(
    "click",
    event => {

        if (
            event.target === classModal
        ) {
            closeClassModal();
        }
    }
);


categoryModal.addEventListener(
    "click",
    event => {

        if (
            event.target === categoryModal
        ) {
            closeCategoryModal();
        }
    }
);


/* =========================================
   編集画面に削除ボタンを追加
========================================= */

function addDeleteButtonToModal() {

    const container =
        document.querySelector(
            ".modal-buttons"
        );

    const deleteButton =
        document.createElement("button");

    deleteButton.id =
        "deleteClassBtn";

    deleteButton.textContent =
        "授業を削除";

    deleteButton.style.background =
        "#ffdddd";

    deleteButton.style.color =
        "#b00000";

    deleteButton.style.display =
        "none";


    container.insertBefore(
        deleteButton,
        saveClassBtn
    );


    deleteButton.addEventListener(
        "click",
        () => {

            if (editingClassId) {

                deleteClass(
                    editingClassId
                );
            }
        }
    );
}


addDeleteButtonToModal();


/* =========================================
   編集時の削除ボタン表示
========================================= */

const originalOpenEditClass =
    openEditClass;

function updateDeleteButton() {

    const button =
        document.getElementById(
            "deleteClassBtn"
        );

    if (!button) return;

    button.style.display =
        editingClassId
            ? "block"
            : "none";
}


/* =========================================
   openNewClass / openEditClass後に更新
========================================= */

newClassBtn.addEventListener(
    "click",
    () => {

        setTimeout(
            updateDeleteButton,
            0
        );
    }
);


document.addEventListener(
    "click",
    () => {

        setTimeout(
            updateDeleteButton,
            0
        );
    }
);


/* =========================================
   全体描画
========================================= */

function renderAll() {

    renderScheduleSelect();

    renderTimetable();

    renderCategories();

    renderColors();
}


/* =========================================
   起動
========================================= */

renderAll();
