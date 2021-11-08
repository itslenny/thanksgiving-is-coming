const STARTING_TURKEY_COUNT = 2;
const TURKEY_SPEED = 20;
const TICK_TIME = 10;

document.addEventListener('DOMContentLoaded', () => {
    new ThanksgivingIsComing();
});

function createNewTurkey() {
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;
    return { x: parseInt(maxX / 2, 10), y: parseInt(maxY / 2, 10), flip: false, hasSanta: false };
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

    if (dirX > 0 && turkey.x > maxX - 200) {
        turkey.dirX = -dirX;
    } else if (dirX < 0 && turkey.x < 0) {
        turkey.dirX = -dirX;
    }
    if (dirY > 0 && turkey.y > maxY) {
        turkey.dirY = -dirY;
        turkey.hasSanta = true;
    } else if (dirY < 0 && turkey.y < 0) {
        turkey.dirY = -dirY;
        turkey.hasSanta = false;
    }
    turkey.flip = dirX < 0 ? false : true;
    return turkey;
}

class ThanksgivingIsComing {

    constructor() {
        this.lastTick = Date.now();

        // init thanksgiving
        const thanksGivingUTC = new Date('2021-11-25');
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

    get formattedTimeRemainingParts() {
        const formatTimePart = (v, suffix) => (v > 9 ? '' : '0') + v + ' ' + suffix + (v === 1 ? '' : 's');
        const msRemaining = this.thanksgiving - Date.now();
        let seconds = parseInt(msRemaining / 1000, 10);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds - (hours * 3600)) / 60);
        seconds = seconds - (hours * 3600) - (minutes * 60);
        return [formatTimePart(hours, 'hour'), formatTimePart(minutes, 'minute'), formatTimePart(seconds, 'second')]

    }

    // this function is called...
    onEachTick() {
        const now = Date.now();
        if (now - this.lastTick > TICK_TIME) {
            this.lastTick = now;
            this.viewModel.counter = this.formattedTimeRemainingParts;

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

        target?.forEach(e => {
            const hourTarget = e.querySelector('.hours');
            const minuteTarget = e.querySelector('.minutes');
            const secondTarget = e.querySelector('.seconds');
    
            hourTarget.innerText = value[0] || '';
            minuteTarget.innerText = value[1] || '';
            secondTarget.innerText = value[2] || '';
            // console.log('value', value, hourTarget, minuteTarget, secondTarget);
        });

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
                const clonedTurkey = turkeys[0].cloneNode(true);
                clonedTurkey.classList.remove('has-santa');
                turkeys[0].parentElement.appendChild(clonedTurkey);
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
        const domHasSanta = target.classList.contains('has-santa');

        if (turkey.hasSanta !== domHasSanta) {
            if (domHasSanta) {
                const santa = target.querySelector('.bitch-ass-santa');
                const santaRect = santa.getBoundingClientRect();
                const newSanta = santa.cloneNode();
                newSanta.classList.remove('bitch-ass-santa');
                newSanta.classList.add('falling-santa');
                if (turkey.flip) {
                    newSanta.classList.add('falling-santa-flipped');
                }
                newSanta.style.left = santaRect.x + 'px';
                newSanta.style.top = santaRect.y + 'px';

                const turkeyCage = document.getElementById('turkey-cage');
                turkeyCage.appendChild(newSanta);
                newSanta.addEventListener('animationend', () => {
                    turkeyCage.removeChild(newSanta);
                });

                target.classList.remove('has-santa');

            } else {
                target.classList.add('has-santa');
            }
        }
    }
}