import {Point} from "./geometry";
import {DrawableActor, DrawableMap, DrawableSensor} from "../graphics/drawer";
import {PhisicsActor, PhisicsMap, PhisicsSensor} from "../phisics/phisics";
import {extractImageData} from "../image/helpers";
import {LogicActor, LogicMap, LogicSensor, LogicTargetSensor} from "../logic/logic";
import {LogicStatus} from "../logic/logic_status";
import {FunctionIntervals} from "../logic/function_intervals";

export class BlankSensor implements PhisicsSensor, LogicSensor, DrawableSensor {
    //  Дальность измерения датчика
    distance: number;

    //  Угол поворота относительно машинки
    angle: number;

    //  Значение сенсора - расстояние до препятствия
    value: number;

    constructor(distance: number, angle: number){
        this.value = 0;
        this.distance = distance;
        this.angle = angle;
    }
}

export class TargetSensor implements LogicTargetSensor {
    public angle: number;
    public distance: number;

    constructor(){
        this.angle = 0;
        this.distance = 0;
    }
}

export type CarSettings = {
    turn_radius: number,
    max_speed: number,
    acceleration: number,
    sensor_len: number,
    coordinates: Point,
    angle: number,
};

export class BlankCar implements DrawableActor, PhisicsActor, LogicActor {
    coordinates: Point;

    speed: number;
    necessary_speed: number;
    max_speed: number;
    acceleration: number;

    angle: number;
    wheel_angle: number;
    turn_radius: number;

    sensors: Array<BlankSensor>;
    target: TargetSensor;
    status: LogicStatus;

    public constructor(readonly view: ImageBitmap, cs: CarSettings) {
        this.coordinates = cs.coordinates;
        this.angle = cs.angle;
        this.speed = 0;

        this.necessary_speed = 100;
        this.wheel_angle = 0;

        this.turn_radius = cs.turn_radius;
        this.max_speed = cs.max_speed;

        this.acceleration = cs.acceleration;

        this.sensors = [
            new BlankSensor(cs.sensor_len, -Math.PI/2),
            new BlankSensor(cs.sensor_len, -Math.PI/4), // LEFT
            new BlankSensor(cs.sensor_len, 0),          // MIDDLE
            new BlankSensor(cs.sensor_len, Math.PI/4),   // RIGHT
            new BlankSensor(cs.sensor_len, Math.PI/2)
        ];
        this.target = new TargetSensor();
        this.status = new LogicStatus(new FunctionIntervals(cs.turn_radius, cs.max_speed));
    }

    public get height() {
        return this.view.height;
    }

    public get width() {
        return this.view.width;
    }
}

class PhysicsMap {
    private readonly map: Uint8Array;
    private readonly height: number;
    private readonly width: number;

    constructor(img: ImageData) {
        this.height = img.height;
        this.width = img.width;
        this.map = new Uint8Array(img.height * img.width);
        for (let i = 0; i < this.map.length; i++) {
            this.map[i] = [0, 1, 2].map(j => img.data[4 * i + j]).reduce((a, b) => Math.min(a, b))
        }
    }

    is_barrier(p: Point): boolean {
        if (p.x < 0 || p.y < 0 || p.x > this.width || p.y > this.height) {
            return true
        }
        return 255 !== this.map[p.x + p.y * this.width]
    }
}

export class BlankMap extends PhysicsMap implements DrawableMap, PhisicsMap, LogicMap {
    public target: Point;

    public constructor(readonly stage: ImageBitmap, public car: BlankCar, target: Point) {
        super(extractImageData(stage))
        this.target = target;
    }

    public actors() {
        return [this.car];
    }
}
