const sectors = [
    {color: "#e22385", text: "#ffffff", label: "1000₽"},
    {color: "#7d2870", text: "#ffffff", label: "500₽"},
    {color: "#e22385", text: "#ffffff", label: "300₽"},
    {color: "#7d2870", text: "#ffffff", label: "0₽"},
    {color: "#e22385", text: "#ffffff", label: "300₽"},
    {color: "#7d2870", text: "#ffffff", label: "100₽"},
    {color: "#e22385", text: "#ffffff", label: "500₽"},
    {color: "#7d2870", text: "#ffffff", label: "100₽"},
];

const events = {
    listeners: {},
    addListener: function (eventName, fn) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(fn);
    },
    fire: function (eventName, ...args) {
        if (this.listeners[eventName]) {
            for (let fn of this.listeners[eventName]) {
                fn(...args);
            }
        }
    },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;
const ticketCountElement = document.getElementById('ticket-count');


const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians
let spinButtonClicked = false;
// let isAdd = document.getElementById("isAdd").value;
let isAdd = "false"


const getIndex = () => {
    return Math.floor(tot - (ang / TAU) * tot) % tot;
};

function drawSector(sector, i) {
    const ang = arc * i;
    ctx.save();

    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();

    // TEXT
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = sector.text;
    ctx.font = "bold 24px 'Lato', sans-serif";
    ctx.fillText(sector.label, rad - 20, 10);
    ctx.restore();
}

function rotate() {
    const sector = sectors[getIndex()];
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

    spinEl.textContent = !angVel ? "SPIN" : sector.label;
    spinEl.style.background = sector.color;
    spinEl.style.color = sector.text;
}

function frame() {
    if (!angVel && spinButtonClicked) {
        const finalSector = sectors[getIndex()];
        events.fire("spinEnd", finalSector);
        spinButtonClicked = false; // reset the flag
        return;
    }

    angVel *= friction; // Decrement velocity by friction
    if (angVel < 0.002) angVel = 0; // Bring to stop
    ang += angVel; // Update angle
    ang %= TAU; // Normalize angle
    rotate();
}

function engine() {
    frame();
    requestAnimationFrame(engine);
}

function init() {
    sectors.forEach(drawSector);
    rotate();

    spinEl.addEventListener("click", () => {
        if (isAdd !== "true") {
            if (!angVel) angVel = rand(0.25, 0.45);
            spinButtonClicked = true;
            ticketCountElement.textContent = '0';
            isAdd = "true";
            engine();
        } else {
            showModal("Попытки закончились<br>Следующая через 23 часа");
        }
    });
}


function showModal(message) {
    const modal = document.getElementById("modal");
    const modalMessage = document.getElementById("modalMessage");

    modalMessage.innerHTML = message;
    modal.style.display = "flex"; // Показываем модальное окно
}

// Закрытие модального окна
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
});

// Добавляем слушатель для завершения вращения
events.addListener("spinEnd", (sector) => {


    if (sector.label !== "0₽") {
        showModal(`Поздравляем!<br>
        Вы выиграли купон на ${sector.label}<br><br>
        Купон будет зачислен в течение 24 часов `)
    } else {
        showModal(`К сожалению вы не выиграли…`)
    }
});


init();


window.onload = function () {
    const image = document.getElementById('image');
    const content = document.getElementById('app-container');
    const image_wb = document.getElementById('image-container');

    // После загрузки страницы эффект размытия
    setTimeout(() => {
        image.style.filter = 'blur(10px)';
        image.style.opacity = '0';
    }, 1000); // Появление картинки через 1 секунду

    // После окончания размытия показываем контент
    setTimeout(() => {
        image.style.display = 'none'; // Скрываем картинку
        image_wb.style.display = 'flex';
        content.style.display = 'block'; // Показываем содержимое
    }, 3000); // Длительность размытия + время до появления контента
}

