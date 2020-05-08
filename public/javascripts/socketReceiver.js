const baseURL = new URL(window.location.href).host;
var socket = io(baseURL);

const logger = document.getElementById("log");

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

const setTime = (minutes, seconds) => {
    const timer = document.getElementById("timer");
    timer.innerHTML = `${minutes.pad(2)}:${seconds.pad(2)}`;
}

const sendError = (message) => {
    socket.emit("response", {type: "error", message});
};

const emitStart = (minutes, seconds) => {
    setTime(minutes, seconds);
    socket.emit("response", {type: "start", minutes, seconds});
}

const time = (minutes, seconds) => {
    setTime(minutes, seconds);
    socket.emit("response", {type: "time", minutes, seconds});
}

const reset = () => {
    socket.emit("response", {type: "reset"});
}

const unlock = () => {
    sendError("Connection Re-established");
    setTimeout(() => {
        socket.emit("response", {type: "unblock"});
    }, 700);
}

let minutes = 8;
let seconds = 0;
let updateId;

let stage = 0;
let penalties = 0;
const penaltyDuration = 5;
let penaltyTimer = 0;

const stages = {
    // Starting the game
    0: {
        script: "I am currently at 17.1, 256.942, 589.37 and tumbling out of control. You need to stablize the ship.",
        expect: {
            slider5: 8,
            slider6: 31,
            slider7: -98,
            control6: true,
        },
        error: "",
    },
    // Getting back on track
    1: {
        script: "I am no longer tumbling through space, but we are still are on course to collide. We need to restart the engines. (My capsule is CA259)",
        expect: {
            control1: true,
            control2: true,
            control3: false,
            control4: false,
            control5: false,
            control6: false,
            control7: true,
            control8: false,
            control9: false,
        }
    },
    2: {
        script: "The engines are starting up, but the guidance system does seem picking up my location correctly. We need to callibrate the probe.",
        expect: {
            control1: false,
            control2: false,
            control3: true,
            control4: false,
            control5: true,
            control6: false,
            control7: false,
            control8: false,
            control9: true,
        }
    },
    3: {
        script: "The control surfaces are not responding. We need to adjust them.",
        expect: {
            control1: false,
            control2: false,
            control3: true,
            control4: false,
            control5: false,
            control6: false,
            control7: false,
            control8: false,
            control9: false,
            slider5: "4",
            slider6: "21",
            slider7: "24",
        },
    },
    4: {
        script: "The wings are misaligned and are causing me to veer off course. We need to realign them before I can continue.",
        expect: {
            control1: false,
            control2: true,
            control3: false,
            control4: true,
            control5: false,
            control6: false,
            control7: false,
            control8: false,
            control9: true,
        },
    },
    5: {
        script: "The wings are realigned. All systems functional. Thank you for saving me and my space ship!",
        expect: {
            impossible: true,
        },
    },
}

const terminal = document.getElementById("script");
const error = document.getElementById("error");

const updateTime = () => {
    clearTimeout(updateId);
    if (minutes <= 0 && seconds <= 0) {
        clearTimeout(penalizeId);
        sendError("Capsule Destroyed! Connection Lost.")
        return;
    }
    if (seconds <= 0) {
        seconds = 60;
        minutes -= 1;
    }
    seconds -= 1;
    time(minutes, seconds);
    updateId = setTimeout(updateTime, 950);
}

let penalizeId;
const penalize = (penaltyTimer) => {
    clearTimeout(penalizeId);
    if (penaltyTimer > 0) {
        sendError(`Invalid Configuration. System Restarting... Attempting to reconnect in ${penaltyTimer} seconds`);
        penalizeId = setTimeout(() => {
            penalize(penaltyTimer - 1);
        }, 950);
    } else {
        unlock();
    }
};

const startGame = () => {
    stage = 0;
    minutes = 8;
    seconds = 0;
    penalties = 0;

    sendError("Connection Established");
    clearTimeout(updateId);
    setTimeout(() => {
        emitStart(minutes, seconds);
        updateId = setTimeout(updateTime, 950);
    }, 700);
    
    terminal.innerHTML = stages[stage].script;
    error.innerHTML = stages[stage].error;
}

const pauseGame = () => {
    clearTimeout(updateId);
    sendError("Event Paused");
}

const resumeGame = () => {
    clearTimeout(updateId);
    sendError("Event Resuming");
    setTimeout(() => {
        socket.emit("response", {type: "unblock"});
        updateId = setTimeout(updateTime, 950);
    }, 700);
}

const toggle = (data) => {
    const {id, value} = data;
    const slider = document.getElementById(`checkbox${id}`);
    if (slider.classList.contains("toggle") == value) {
        slider.classList.toggle("toggle");
    }
}

const match = (expect, data) => {
    return Object.keys(expect).every(i => {
        return expect[i] == data[i];
    });
}

const handleCommand = (data) => {
    switch (stage) {
        case 0:
            if (match(stages[stage].expect, data)) {
                stage += 1;
                terminal.innerHTML = stages[stage].script;
                const activeCount = Object.values(data).filter(c => c === true).length;
                error.innerHTML = activeCount == 1 ? "" : "The system noticed some extra tools activated. No issues popped up this time, but invalid tool configurations may cause system resets.";
                reset();
            } else {
                if (data.control6) {
                    error.innerHTML = "It seems I am no longer heading to Jupiter. Make sure you point me towards Jupiter."
                } else {
                    error.innerHTML = "Did you engage the correct tools needed to stop my tumbling?"
                }
            }
            break;
        case 1:
            if (match(stages[stage].expect, data)) {
                stage += 1;
                terminal.innerHTML = stages[stage].script;
                error.innerHTML = "";
                reset();
            } else {
                error.innerHTML = "That was an invalid configuration. The system is resetting. The first reset is quick, but later resets may take longer. Please be careful."
                penalties += 1;
                penaltyTimer = penalties * penaltyDuration;
                penalize(penaltyTimer);
            }
            break;
        case 2:
            if (match(stages[stage].expect, data)) {
                stage += 1;
                terminal.innerHTML = stages[stage].script;
                error.innerHTML = "";
                reset();
            } else {
                error.innerHTML = "The purple paint contains different colors of pigment."
                penalties += 1;
                penaltyTimer = penalties * penaltyDuration;
                penalize(penaltyTimer);
            }
            break;
        case 3:
            if (match(stages[stage].expect, data)) {
                stage += 1;
                terminal.innerHTML = stages[stage].script;
                error.innerHTML = "";
                reset();
            } else {
                error.innerHTML = "Is there any other information I can provide you? Are there any notes in the diagonistic guide?"
                penalties += 1;
                penaltyTimer = penalties * penaltyDuration;
                penalize(penaltyTimer);
            }
            break;
        case 4:
            if (match(stages[stage].expect, data)) {
                stage += 1;
                terminal.innerHTML = stages[stage].script;
                error.innerHTML = "";
                reset();
                clearTimeout(updateId);
            } else {
                error.innerHTML = "Make sure the code is present for both flap types."
                penalties += 1;
                penaltyTimer = penalties * penaltyDuration;
                penalize(penaltyTimer);
            }
            break;
        case 5:
            break;
    }
}

socket.on("broadcast", (data) => {
    console.log(data);
    const {device} = data;
    switch (device) {
        case "checkbox":
            toggle(data);
            break;
        case "sendCommand":
            handleCommand(data);
            break;
        default:
            return;
    }
})