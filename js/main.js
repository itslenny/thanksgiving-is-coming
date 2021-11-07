const STARTING_TURKEY_COUNT = 2;
const TURKEY_SPEED = 150;
const TICK_TIME = 200;

document.addEventListener('DOMContentLoaded', () => {
    new ThanksgivingIsComing();
});

function doTurkeyBrainThings(sourceTurkey) {
    const turkey = { ...sourceTurkey };

    const maxX = window.innerWidth;
    const maxY = window.innerHeight;

    const dirX = turkey.dirX || parseInt(TURKEY_SPEED * (Math.random() - 0.5), 10);
    const dirY = turkey.dirY || parseInt(TURKEY_SPEED * (Math.random() - 0.5), 10);

    turkey.x += dirX;
    turkey.y += dirY;
    turkey.flip = dirX < 0 ? false : true;

    if (turkey.x > maxX || turkey.x < 0) {
        turkey.dirX = -dirX;
        turkey.x = Math.min(Math.max(turkey.x, 0), maxX)
    }
    if (turkey.y > maxY || turkey.y < 0) {
        turkey.dirY = -dirY;
        turkey.y = Math.min(Math.max(turkey.y, 0), maxY)
    }
    return turkey;
}

class ThanksgivingIsComing {

    constructor() {

        // init thanksgiving
        const thanksGivingUTC = new Date('2021-11-25')
        const timeZoneOffset = thanksGivingUTC.getTimezoneOffset();
        const thanksGivingLocal = new Date(thanksGivingUTC);
        thanksGivingLocal.setMinutes(thanksGivingLocal.getMinutes() + timeZoneOffset);
        this.thanksgiving = thanksGivingLocal.getTime();

        // init view model
        this.viewModel = new ActiveViewModel();
        this.viewModel.turkeys = new Array(STARTING_TURKEY_COUNT).fill(1).map(_ => ({ x: 0, y: 0, flip: false }));

        // add click listeners
        document.getElementById('add-turkey').addEventListener('click', () => {
            this.viewModel.turkeys.push({ ...this.viewModel.turkeys[0], dirX: null, dirY: null, flip: false });
        });

        // start the clock
        this.timer = setInterval(this.onEachTick.bind(this), TICK_TIME);
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
        this.viewModel.counter = this.formattedTimeRemaining;

        this.viewModel.turkeys = this.viewModel.turkeys.map(doTurkeyBrainThings);
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