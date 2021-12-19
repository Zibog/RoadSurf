
import { Point } from "../base/geometry";

export interface PhisicsActor{
    // Координаты центра
    coordinates: Point;

    speed: number;
    readonly necessary_speed: number;
    readonly max_speed: number;
    readonly acceleration: number;

    angle: number;
    readonly wheel_angle: number;
    readonly turn_radius: number;

    readonly height: number;
    readonly width: number;

    sensors: Array<PhisicsSensor>;
    target: PhisicsTargetSensor;
}

export interface PhisicsMap{
    // Цель для машинок
    readonly target: Point;

    // Возвращает true если в данной точке есть препятствие
    is_barrier(p: Point): boolean;

    // Все акторы
    actors(): Array<PhisicsActor>;
}

export interface PhisicsSensor{
    //  Дальность измерения датчика
    readonly distance: number;

    //  Угол поворота относительно машинки
    readonly angle: number;

    //  Значение сенсора - расстояние до препятствия
    value: number;
}

export interface PhisicsTargetSensor{
    //  угол направления на цель в радианах
    angle: number;
    //  расстояние до цели, в попугаях
    distance: number;
}

export class PhisicsContext{
    private _map: PhisicsMap;

    constructor(map: PhisicsMap){
        this._map = map;
    }

    private line_x(p0: Point, p1: Point, y: number){
        return (y - p0.y) * (p1.x - p0.x) / (p1.y - p0.y) + p0.x;
    }

    private my_max(a: number, b: number){
        if(isNaN(a))
            return b;
        if(isNaN(b))
            return a;
        return Math.max(a, b);
    }

    private my_min(a: number, b: number){
        if(isNaN(a))
            return b;
        if(isNaN(b))
            return a;
        return Math.min(a, b);
    }

    private update_sensor(sensor: PhisicsSensor, start: Point, add_angle: number){
        let angle = sensor.angle + add_angle;
        let sin_a = Math.sin(angle);
        let cos_a = Math.cos(angle);

        for(let i = 0; i < sensor.distance; ++i)
            if(this._map.is_barrier(start.add(new Point(-i * sin_a, i * cos_a)).round())){
                sensor.value = i;
                return;
            }
        //  если ничего не увидели, делаем бесконечность(можно поменять)
        sensor.value = Infinity;
    }

    private recorrect_angle(angle: number){
        if(angle > Math.PI)
            angle -= 2 * Math.PI;
        if(angle < -Math.PI)
            angle += 2 * Math.PI;
        return angle;
    }

    tick(dt: number){
        let actors = this._map.actors();

        for(let i = 0; i < actors.length; ++i){
            let actor = actors[i];

            //  подобие матрицы поворота
            let sin_a = Math.sin(actor.angle);
            let cos_a = Math.cos(actor.angle);
            //  сохраняем старую позицию и поворот что бы если что вернуться
            let last_point = actor.coordinates;
            let last_angle = actor.angle;
            //  проеханное за такт расстояние
            let dist = actor.speed * dt;
            //  новая координата и поворот
            actor.coordinates = actor.coordinates.add(new Point(-dist * sin_a, dist * cos_a));
            let wheel_angle = Math.min(Math.abs(actor.wheel_angle), Math.PI / 4) * Math.sign(actor.wheel_angle);
            let tern_radius = actor.turn_radius * 2 * Math.sqrt(1/Math.pow(Math.sin(wheel_angle), 2) - 3 / 4);
            actor.angle = this.recorrect_angle(actor.angle + Math.sign(wheel_angle) * dist / tern_radius);

            let necessary_speed = Math.min(Math.abs(actor.necessary_speed), actor.max_speed) * Math.sign(actor.necessary_speed);
            if(actor.speed > necessary_speed)
                actor.speed -= actor.acceleration * dt;
            if(actor.speed < necessary_speed)
                actor.speed += actor.acceleration * dt;

            //  -- Коллизии -- //

            //  длина и ширина для коллизий
            let a = actor.width / 2;
            let b = actor.height / 2;
            //  хардкодим перемножение матриц
            let A1 = a * cos_a - b * sin_a;
            let A2 = a * cos_a + b * sin_a;
            let B1 = a * sin_a + b * cos_a;
            let B2 = a * sin_a - b * cos_a;
            //  точки прямоугольника
            let points = [
                new Point(A1, B1),
                new Point(A2, B2),
                new Point(-A1, -B1),
                new Point(-A2, -B2),
            ]
            //  сортируем точки по часовой стрелки от верхней
            let max = points[0].y;
            let num = 0;
            for(let j = 1; j < 4; ++j)
                if(points[j].y > max){
                    max = points[j].y;
                    num = j;
                }
            // точки, с правильным взаимным расположением и сдвигом
            let p_up    = points[num].add(actor.coordinates);
            let p_right = points[(num + 1) % 4].add(actor.coordinates);
            let p_down  = points[(num + 2) % 4].add(actor.coordinates);
            let p_left  = points[(num + 3) % 4].add(actor.coordinates);
            //  Собственно, циклик проверки коллизий
            let is_collision = false;
            for(let y = Math.round(p_down.y); y < p_up.y && !is_collision; ++y){
                let start = this.my_max(this.line_x(p_down, p_left, y), this.line_x(p_left, p_up, y));
                let finish = this.my_min(this.line_x(p_down, p_right, y), this.line_x(p_right, p_up, y));

                for(let x = Math.round(start); x < finish && !is_collision; ++x){
                    if(this._map.is_barrier(new Point(x, y)))
                        is_collision = true;
                }
            }
            //  если врезались, останавливаемся и возвращаем старые координаты
            if(is_collision){
                actor.coordinates = last_point;
                actor.angle = last_angle;
                actor.speed = 0;
            }

            //  --  Сенсоры --  //

            //  сенсоры дальности
            actor.sensors.forEach(sensor =>
                this.update_sensor(sensor, actor.coordinates, actor.angle));
            //  сенсор цели
            let delta = this._map.target.sub(actor.coordinates);
            actor.target.distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

            let acos = Math.acos(delta.y / actor.target.distance );
            actor.target.angle = this.recorrect_angle(-Math.sign(delta.x) * acos - actor.angle);
            // console.log(actor.target.angle);
        }
    }
}
