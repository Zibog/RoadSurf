import { info_display } from "../base/info_display";
import { LogicStatus } from "./logic_status";
export interface LogicActor{
    // Фактическая скорость
    readonly speed: number;
    // Скорость, до которой надо бы разогнаться
    necessary_speed: number;
    // угол поворота колёс
    wheel_angle: number;
    // Массив сенсоров
    sensors: Array<LogicSensor>;
    //  Сенсор направления на цель
    target: LogicTargetSensor;
    //  Состояние машинки
    status: LogicStatus;
}

export interface LogicSensor{
    //  Дальность измерения датчика
    readonly distance: number;
    //  Угол поворота относительно машинки
    readonly angle: number;
    //  Значение сенсора - расстояние до препятствия
    readonly value: number;
}

export interface LogicTargetSensor{
    //  угол направления на цель в радианах
    readonly angle: number;
    //  расстояние до цели, в попугаях
    readonly distance: number;
}

export interface LogicMap{
    // Все акторы
    actors(): Array<LogicActor>;
}

export class Logic{
    private _map: LogicMap;

    constructor(map: LogicMap) {
        this._map = map;
    }

    tick(dt: number){
        this._map.actors().forEach(actor => {
            let sensor_values = actor.sensors.map((val) => val.value);
            info_display.print_sensors_distance(sensor_values);
            actor.status.update(sensor_values, actor.target.angle, actor.target.distance);
            actor.necessary_speed = actor.status.output_speed;
            actor.wheel_angle = actor.status.output_turn;

            // Проверка на близость к цели
            if (actor.target.distance < 20)
                actor.necessary_speed = 0;
        })
    }
}