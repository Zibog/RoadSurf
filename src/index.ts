import {Drawer} from "./graphics/drawer";
import {downloadBitmap, fileAsURL} from "./image/helpers";
import {DEFAULT_CAR, DEFAULT_TARGET, Simulator} from "./simulator";
import {Point} from "./base/geometry";
import {FunctionIntervals} from "./logic/function_intervals";
import './index.css'

(document.getElementById("max-speed") as HTMLInputElement).value = DEFAULT_CAR.max_speed.toString();
(document.getElementById("turn-radius") as HTMLInputElement).value = DEFAULT_CAR.turn_radius.toString();
(document.getElementById("sensor-length") as HTMLInputElement).value = DEFAULT_CAR.sensor_len.toString();

const canvas = document.getElementById('main') as HTMLCanvasElement;
const drawer = new Drawer(canvas);
const simulator = new Simulator(drawer);

const pause_button = document.getElementById("start-button") as HTMLButtonElement

function pause() {
    simulator.pause = true;
    pause_button.textContent = "Continue"
}

function unpause() {
    simulator.pause = false;
    pause_button.textContent = "Pause"
}

function toggle() {
    if (simulator.pause)
        unpause();
    else
        pause();
}

pause_button.addEventListener('click', ev => {
    toggle();
})

unpause();

Promise.all(["circus2.png", "small_car.png"].map(src => downloadBitmap(`./resources/${src}`)))
    .then(function ([map, car]) {
        const settings = {map, car, car_settings: DEFAULT_CAR, target: DEFAULT_TARGET, time: 1};
        simulator.startSimulation(settings);
        const map_form = document.getElementById("map-settings") as HTMLFormElement;
        map_form.addEventListener("submit", ev => {
            const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
            const maybeImg = fileInput?.files?.item(0);
            if (maybeImg) {
                fileAsURL(maybeImg).then(downloadBitmap).then(map => {
                    settings.map = map;
                    pause();
                    simulator.startSimulation(settings);
                })
            }
            ev.preventDefault()
        });
        const car_form = document.getElementById("car-settings") as HTMLFormElement;
        car_form.addEventListener("submit", ev => {
            ev.preventDefault();
            let max_speed = parseInt((document.getElementById("max-speed") as HTMLInputElement).value);
            let turn_radius = parseInt((document.getElementById("turn-radius") as HTMLInputElement).value);
            let sensor_len = parseInt((document.getElementById("sensor-length") as HTMLInputElement).value);
            if (max_speed != null && turn_radius != null && sensor_len != null) {
                if (!FunctionIntervals.validate_input_values(turn_radius, sensor_len, max_speed)) {
                    alert("Некорректные входные данные: \n" + FunctionIntervals.validate_input_values.toString())
                    return
                }
                settings.car_settings.max_speed = max_speed;
                settings.car_settings.turn_radius = turn_radius;
                settings.car_settings.sensor_len = sensor_len;

                pause();
                simulator.startSimulation(settings);
            }
        });
        let tardis = document.getElementById("tardis") as HTMLFormElement;
        tardis.addEventListener("submit", ev => {
            ev.preventDefault();
            settings.time = tardis.querySelector<HTMLInputElement>('input[type="number"]')!.valueAsNumber;
            simulator.restartTimer(settings.time);
        });

        canvas.addEventListener('click', ev => {
            ev.preventDefault();

            let x = ev.pageX - canvas.offsetLeft;
            let y = ev.pageY - canvas.offsetTop;
            settings.target = drawer.scale(new Point(x, y));
            simulator.setTarget(settings.target)
        });
        canvas.addEventListener("auxclick", ev => {
            ev.preventDefault();

            let x = ev.pageX - canvas.offsetLeft;
            let y = ev.pageY - canvas.offsetTop;
            settings.car_settings.coordinates = drawer.scale(new Point(x, y));

            pause();
            simulator.startSimulation(settings);
        });
        canvas.addEventListener("wheel", ev => {
            ev.preventDefault();
            if (simulator.pause) {
                if (simulator.context != null)
                    settings.car_settings.coordinates = simulator.context.car.coordinates;
                settings.car_settings.angle += ev.deltaY * 0.002;
                simulator.startSimulation(settings);
            }
        });
    });

