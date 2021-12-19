import {Drawer} from "./graphics/drawer";
import {BlankCar, BlankMap, CarSettings} from "./base/entities";
import {Point} from "./base/geometry";
import {PhisicsContext} from "./phisics/phisics";
import {Logic} from "./logic/logic";


export const DEFAULT_CAR = {
    turn_radius: 15,
    max_speed: 100,
    acceleration: 10,
    sensor_len: 105,
    coordinates: new Point(750, 750),
    angle: 0,
};

export const DEFAULT_TARGET = new Point(50, 50);

export type Settings = {
    map: ImageBitmap,
    car: ImageBitmap,
    car_settings: CarSettings,
    target: Point,
    time: number,
}

export class Simulator {
    public context: { map: BlankMap, car: BlankCar } | null = null;
    public pause: boolean = false;
    private lastTimer = 0;
    private timerCallback?: () => void;
    private dt = 0.05;

    constructor(private drawer: Drawer) {
    }

    setTarget(target: Point) {
        if (this.context != null) {
            this.context.map.target = target;
        }
    }

    startSimulation(settings: Settings) {

        let map = new BlankMap(settings.map, new BlankCar(settings.car, settings.car_settings), settings.target);
        map.car.coordinates = settings.car_settings.coordinates;
        let ph = new PhisicsContext(map);
        this.context = {map, car: map.car};
        let logic = new Logic(map);
        this.timerCallback = () => {
            if (!this.pause) {
                ph.tick(this.dt);
                logic.tick(this.dt);
            }
            this.drawer.draw(map);
        };
        this.restartTimer(settings.time)
    }

    restartTimer(timeMultiply: number) {
        if (this.lastTimer !== 0) {
            window.clearInterval(this.lastTimer);
        }
        this.lastTimer = window.setInterval(this.timerCallback!, this.dt * 1000 / timeMultiply);
    }
}