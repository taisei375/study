// ================================
// 学習計画カレンダー
// app.js
// ================================


// -------------------------------
// 状態
// -------------------------------

let currentDate = new Date();

let selectedDate = new Date();

let plans = JSON.parse(
    localStorage.getItem("studyPlans")
) || [];


// -------------------------------
// HTML要素
// -------------------------------

const calendarGrid =
    document.getElementById("calendarGrid");

const monthTitle =
    document.getElementById("monthTitle");

const selectedDateTitle =
    document.getElementById("selectedDateTitle");

const planList =
    document.getElementById("planList");

const planModal =
    document.getElementById("planModal");

const planForm =
    document.getElementById("planForm");

const planDate =
    document.getElementById("planDate");

const planTitle =
    document.getElementById("planTitle");

const planStart =
    document.getElementById("planStart");

const planEnd =
    document.getElementById("planEnd");

const planMinutes =
    document.getElementById("planMinutes");

const planCategory =
    document.getElementById("planCategory");

const planMemo =
    document.getElementById("planMemo");

const planCompleted =
    document.getElementById("planCompleted");


// -------------------------------
// 日付を YYYY-MM-DD にする
// -------------------------------

function formatDate(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// -------------------------------
// 日本語表示用の日付
// -------------------------------

function formatJapaneseDate(date) {

    return `${date.getFullYear()}年
        ${date.getMonth() + 1}月
        ${date.getDate()}日`;

}


// -------------------------------
// カレンダー表示
// -------------------------------

function renderCalendar() {

    calendarGrid.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    monthTitle.textContent =
        `${year}年${month + 1}月`;


    // 月初の曜日
    const firstDay =
        new Date(year, month, 1).getDay();


    // 月の日数
    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    // 前月の日数
    const daysInPreviousMonth =
        new Date(year, month, 0).getDate();


    // ---------------------------
    // 前月の日付
    // ---------------------------

    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        const day =
            daysInPreviousMonth - i;

        const date =
            new Date(year, month - 1, day);

        createCalendarDay(
            date,
            true
        );
    }


    // ---------------------------
    // 今月の日付
    // ---------------------------

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(year, month, day);

        createCalendarDay(
            date,
            false
        );
    }


    // ---------------------------
    // 次月の日付
    // ---------------------------

    const totalCells =
        firstDay + daysInMonth;

    const remaining =
        Math.ceil(totalCells / 7) * 7
        - totalCells;


    for (
        let day = 1;
        day <= remaining;
        day++
    ) {

        const date =
            new Date(year, month + 1, day);

        createCalendarDay(
            date,
            true
        );
    }
}


// -------------------------------
// カレンダーの日付を作成
// -------------------------------

function createCalendarDay(
    date,
    otherMonth
) {

    const dayElement =
        document.createElement("div");

    dayElement.className =
        "calendar-day";


    if (otherMonth) {

        dayElement.classList.add(
            "other-month"
        );
    }


    const dateString =
        formatDate(date);


    // 今日
    const today =
        new Date();

    if (
        formatDate(date) ===
        formatDate(today)
    ) {

        dayElement.classList.add(
            "today"
        );
    }


    // 選択中
    if (
        formatDate(date) ===
        formatDate(selectedDate)
    ) {

        dayElement.classList.add(
            "selected"
        );
    }


    // 日付番号
    const dayNumber =
        document.createElement("div");

    dayNumber.className =
        "day-number";

    dayNumber.textContent =
        date.getDate();


    dayElement.appendChild(
        dayNumber
    );


    // ---------------------------
    // その日の学習計画
    // ---------------------------

    const dayPlans =
        plans.filter(
            plan =>
                plan.date === dateString
        );


    dayPlans.forEach(plan => {

        const planElement =
            document.createElement("div");

        planElement.className =
            `calendar-plan ${plan.category}`;

        if (plan.completed) {

            planElement.style.textDecoration =
                "line-through";

            planElement.style.opacity =
                "0.5";
        }


        let text = plan.title;

        if (plan.start) {

            text =
                `${plan.start} ${plan.title}`;
        }


        planElement.textContent =
            text;


        dayElement.appendChild(
            planElement
        );
    });


    // ---------------------------
    // クリック
    // ---------------------------

    dayElement.addEventListener(
        "click",
        () => {

            selectedDate =
                new Date(date);

            renderCalendar();

            renderPlans();

        }
    );


    calendarGrid.appendChild(
        dayElement
    );
}


// -------------------------------
// 学習計画一覧
// -------------------------------

function renderPlans() {

    const dateString =
        formatDate(selectedDate);


    selectedDateTitle.textContent =
        `${selectedDate.getFullYear()}年` +
        `${selectedDate.getMonth() + 1}月` +
        `${selectedDate.getDate()}日の学習計画`;


    planList.innerHTML = "";


    const dayPlans =
        plans
            .filter(
                plan =>
                    plan.date === dateString
            )
            .sort(
                (a, b) => {

                    return (
                        (a.start || "")
                        .localeCompare(
                            b.start || ""
                        )
                    );

                }
            );


    // 計画がない
    if (dayPlans.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "no-plan";

        empty.textContent =
            "学習計画はありません";

        planList.appendChild(
            empty
        );

        return;
    }


    // 計画を表示
    dayPlans.forEach(plan => {

        const item =
            document.createElement("div");

        item.className =
            "plan-item";


        if (plan.completed) {

            item.classList.add(
                "plan-completed"
            );
        }


        // チェックボックス
        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.className =
            "plan-check";

        checkbox.checked =
            plan.completed;


        checkbox.addEventListener(
            "change",
            () => {

                plan.completed =
                    checkbox.checked;

                savePlans();

                renderCalendar();

                renderPlans();

            }
        );


        // 情報
        const info =
            document.createElement("div");

        info.className =
            "plan-info";


        // タイトル
        const title =
            document.createElement("div");

        title.className =
            "plan-title";

        title.textContent =
            plan.title;


        info.appendChild(title);


        // 時間
        if (
            plan.start ||
            plan.end ||
            plan.minutes
        ) {

            const time =
                document.createElement("div");

            time.className =
                "plan-time";


            let timeText = "";


            if (
                plan.start &&
                plan.end
            ) {

                timeText =
                    `${plan.start}〜${plan.end}`;

            } else if (plan.start) {

                timeText =
                    `${plan.start}〜`;

            }


            if (plan.minutes) {

                if (timeText) {

                    timeText +=
                        ` ・ ${plan.minutes}分`;

                } else {

                    timeText =
                        `${plan.minutes}分`;
                }
            }


            time.textContent =
                timeText;

            info.appendChild(time);
        }


        // メモ
        if (plan.memo) {

            const memo =
                document.createElement("div");

            memo.className =
                "plan-memo";

            memo.textContent =
                plan.memo;

            info.appendChild(memo);
        }


        // 削除ボタン
        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-plan";

        deleteButton.textContent =
            "×";


        deleteButton.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "この学習計画を削除しますか？"
                    );


                if (!confirmed) {

                    return;
                }


                plans =
                    plans.filter(
                        p =>
                            p.id !== plan.id
                    );


                savePlans();

                renderCalendar();

                renderPlans();

            }
        );


        item.appendChild(
            checkbox
        );

        item.appendChild(
            info
        );

        item.appendChild(
            deleteButton
        );


        planList.appendChild(
            item
        );

    });
}


// -------------------------------
// データ保存
// -------------------------------

function savePlans() {

    localStorage.setItem(
        "studyPlans",
        JSON.stringify(plans)
    );
}


// -------------------------------
// モーダルを開く
// -------------------------------

function openPlanModal(
    date = selectedDate
) {

    planModal.classList.remove(
        "hidden"
    );


    planDate.value =
        formatDate(date);


    planTitle.value = "";

    planStart.value = "";

    planEnd.value = "";

    planMinutes.value = "";

    planCategory.value =
        "other";

    planMemo.value = "";

    planCompleted.checked =
        false;


    setTimeout(
        () => planTitle.focus(),
        100
    );
}


// -------------------------------
// モーダルを閉じる
// -------------------------------

function closePlanModal() {

    planModal.classList.add(
        "hidden"
    );
}


// -------------------------------
// 学習計画追加
// -------------------------------

planForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const newPlan = {

            id:
                Date.now(),

            date:
                planDate.value,

            title:
                planTitle.value.trim(),

            start:
                planStart.value,

            end:
                planEnd.value,

            minutes:
                planMinutes.value
                    ? Number(planMinutes.value)
                    : null,

            category:
                planCategory.value,

            memo:
                planMemo.value.trim(),

            completed:
                planCompleted.checked

        };


        if (!newPlan.title) {

            alert(
                "学習内容を入力してください。"
            );

            return;
        }


        plans.push(
            newPlan
        );


        savePlans();


        // 追加した日付を選択
        selectedDate =
            new Date(
                newPlan.date + "T00:00:00"
            );


        // カレンダーの月も変更
        currentDate =
            new Date(
                selectedDate
            );


        closePlanModal();

        renderCalendar();

        renderPlans();

    }
);


// -------------------------------
// ボタン
// -------------------------------


// 学習計画追加
document
    .getElementById("addPlanBtn")
    .addEventListener(
        "click",
        () => {

            openPlanModal(
                selectedDate
            );

        }
    );


// 選択日の学習計画追加
document
    .getElementById(
        "addPlanForDateBtn"
    )
    .addEventListener(
        "click",
        () => {

            openPlanModal(
                selectedDate
            );

        }
    );


// モーダルを閉じる
document
    .getElementById("closeModalBtn")
    .addEventListener(
        "click",
        closePlanModal
    );


// キャンセル
document
    .getElementById("cancelPlanBtn")
    .addEventListener(
        "click",
        closePlanModal
    );


// -------------------------------
// 前月
// -------------------------------

document
    .getElementById("prevMonthBtn")
    .addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() - 1
            );

            renderCalendar();

        }
    );


// -------------------------------
// 次月
// -------------------------------

document
    .getElementById("nextMonthBtn")
    .addEventListener(
        "click",
        () => {

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );

            renderCalendar();

        }
    );


// -------------------------------
// 今日
// -------------------------------

document
    .getElementById("todayBtn")
    .addEventListener(
        "click",
        () => {

            const today =
                new Date();

            currentDate =
                new Date(today);

            selectedDate =
                new Date(today);

            renderCalendar();

            renderPlans();

        }
    );


// -------------------------------
// モーダル外クリック
// -------------------------------

planModal.addEventListener(
    "click",
    event => {

        if (
            event.target === planModal
        ) {

            closePlanModal();
        }

    }
);


// -------------------------------
// 初期表示
// -------------------------------

renderCalendar();

renderPlans();
