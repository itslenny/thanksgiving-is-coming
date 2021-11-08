const STARTING_TURKEY_COUNT = 2;
const TURKEY_SPEED = 20;
const TICK_TIME = 10;
const VIEWPORT_BUFFER_START_PX = 10; // 20;
const VIEWPORT_BUFFER_END_PX = 100;

document.addEventListener('DOMContentLoaded', () => {
    new ThanksgivingIsComing();
});

function createNewTurkey() {
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;
    return { x: parseInt(maxX / 2, 10), y: parseInt(maxY / 2, 10), flip: false };
}

function doTurkeyBrainThings(sourceTurkey) {
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;

    const turkey = { ...sourceTurkey };

    const dirX = turkey.dirX || parseInt(TURKEY_SPEED * (Math.random() - 0.5), 10);
    const dirY = turkey.dirY || parseInt(TURKEY_SPEED * (Math.random() - 0.5), 10);

    turkey.dirX = dirX;
    turkey.dirY = dirY;
    turkey.x += dirX;
    turkey.y += dirY;

    if (turkey.x > maxX - VIEWPORT_BUFFER_END_PX || turkey.x < VIEWPORT_BUFFER_START_PX) {
        turkey.dirX = -dirX;
        // turkey.x = Math.min(Math.max(turkey.x, VIEWPORT_BUFFER_START_PX), maxX - VIEWPORT_BUFFER_END_PX)
    }
    if (turkey.y > maxY - VIEWPORT_BUFFER_END_PX || turkey.y < VIEWPORT_BUFFER_START_PX) {
        turkey.dirY = -dirY;
        // turkey.y = Math.min(Math.max(turkey.y, VIEWPORT_BUFFER_START_PX), maxY - VIEWPORT_BUFFER_END_PX)
    }
    turkey.flip = dirX < 0 ? false : true;
    return turkey;
}

class ThanksgivingIsComing {

    constructor() {
        this.lastTick = Date.now();

        // init thanksgiving
        const thanksGivingUTC = new Date('2021-11-25')
        const timeZoneOffset = thanksGivingUTC.getTimezoneOffset();
        const thanksGivingLocal = new Date(thanksGivingUTC);
        thanksGivingLocal.setMinutes(thanksGivingLocal.getMinutes() + timeZoneOffset);
        this.thanksgiving = thanksGivingLocal.getTime();

        // init view model
        this.viewModel = new ActiveViewModel();
        this.viewModel.turkeys = new Array(STARTING_TURKEY_COUNT).fill(1).map(_ => createNewTurkey());

        // add click listeners
        document.getElementById('add-turkey').addEventListener('click', () => {
            this.viewModel.turkeys.push(createNewTurkey());
        });

        // start the clock
        this.onEachTick();
    }

    get formattedTimeRemaining() {
        const formatTimePart = (v, last) => (v > 9 ? '' : '0') + v + (last ? '' : ':');
        const msRemaining = this.thanksgiving - Date.now();
        let seconds = parseInt(msRemaining / 1000, 10);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds - (hours * 3600)) / 60);
        seconds = seconds - (hours * 3600) - (minutes * 60);
        return formatTimePart(hours) + formatTimePart(minutes) + formatTimePart(seconds, true);
    }

    // this function is called...
    onEachTick() {
        const now = Date.now();
        if (now - this.lastTick > TICK_TIME) {
            this.lastTick = now;
            this.viewModel.counter = this.formattedTimeRemaining;

            this.viewModel.turkeys = this.viewModel.turkeys.map(doTurkeyBrainThings);
        }
        requestAnimationFrame(() => this.onEachTick());
    }
}

class ActiveViewModel {

    constructor() {
    }

    set counter(value) {
        this._counter = value;
        const target = document.querySelectorAll('.counter-target');
        target?.forEach(e => e.innerText = value);
    }

    get counter() {
        return this._counter;
    }

    set turkeys(value) {
        this._turkeys = value;
        while (true) {
            const turkeys = document.querySelectorAll('.jive-turkey');
            if (turkeys.length > value.length) {
                turkeys[0].parentElement.removeChild(turkeys[0]);
            } else if (turkeys.length < value.length) {
                turkeys[0].parentElement.appendChild(turkeys[0].cloneNode());
            } else {
                turkeys.forEach((t, i) => this.drawTurkey(value[i], t));
                break;
            }
        }
        const turkeyCount = document.getElementById('turkey-count');
        turkeyCount.innerText = value.length + ' Turkeys';
    }

    get turkeys() {
        return this._turkeys;
    }

    drawTurkey(turkey, target) {
        const scale = turkey.flip ? -1 : 1;
        target.style.transform = `translate(${turkey.x}px, ${turkey.y}px) scaleX(${scale})`;
    }
}