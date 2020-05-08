const baseURL = new URL(window.location.href).host;
var socket = io(baseURL);

const checkboxes = {
    checkbox0: false,
    checkbox1: false,
    checkbox2: false,
    checkbox3: false,
}

const controls = {
    control1: false,
    control2: false,
    control3: false,
    control4: false,
    control5: false,
    control6: false,
    control7: false,
    control8: false,
    control9: false,
}

const sliders = {
    5: 0,
    6: 0,
    7: 0,
}

const reset = () => {
    Object.keys(controls).forEach(id => {
        document.getElementById(id).checked = controls[id];
    });
    Object.keys(sliders).forEach(id => {
        document.getElementById(`range${id}`).value = sliders[id];
        document.getElementById(`value${id}`).innerHTML = sliders[id];
    });
}

const hardReset = () => {
    Object.keys(checkboxes).forEach(id => {
        document.getElementById(id).checked = checkboxes[id];
    });
    reset();
}

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

const setTime = (minutes, seconds) => {
    const timer = document.getElementById("timer");
    timer.innerHTML = `${minutes.pad(2)}:${seconds.pad(2)}`;
}

const unlock = () => {
    const blocker = document.getElementById("blocker");
    if (!blocker.classList.contains("hidden")) {
        blocker.classList.toggle("hidden");
    }
    const controls = document.getElementById("container");
    if (controls.classList.contains("blur")) {
        controls.classList.toggle("blur");
    }
}

const lock = () => {
    const blocker = document.getElementById("blocker");
    if (blocker.classList.contains("hidden")) {
        blocker.classList.toggle("hidden");
    }
    const controls = document.getElementById("container");
    if (!controls.classList.contains("blur")) {
        controls.classList.toggle("blur");
    }
}

const errorMessage = ({message}) => {
    lock();
    document.getElementById("block-message").innerHTML = message;
}

const start = (data) => {
    hardReset();
    setTime(data.minutes, data.seconds);
    unlock();
}

const checkBox = (id) => {
    const box = document.getElementById(`checkbox${id}`);
    const checked = box.checked;
    socket.emit("input", {device: "checkbox", id, value: checked});
}

const sliderUpdate = (id) => {
    const range = document.getElementById(`range${id}`);
    const rangeValue = range.value;
    const value = document.getElementById(`value${id}`);
    value.innerHTML = rangeValue;
}

const sendCommand = () => {
    const output = {device: "sendCommand"}
    Object.keys(controls).forEach(id => {
        output[id] = document.getElementById(id).checked;
    });
    Object.keys(sliders).forEach(id => {
        output[`slider${id}`] = document.getElementById(`range${id}`).value;
    });
    socket.emit("input", output);
}

const sendData = (data) => {
    socket.emit("input", data);
}

const clicker = () => {
    console.log("clicked");
    sendData("I've been clicked");
}

socket.on("output", (data) => {
    const {type} = data;
    switch (type) {
        case "start":
            console.log('here:', data);
            start(data);
            break;
        case "error":
            errorMessage(data);
            break;
        case "unblock":
            unlock();
            break;
        case "reset":
            reset();
            break;
        case "time": 
            setTime(data.minutes, data.seconds);
            break;
        default:
            return;
    }
});