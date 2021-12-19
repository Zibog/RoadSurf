
export class Point {
    x: number;
    y: number;

    public add(p: Point){
        return new Point(p.x + this.x, p.y + this.y);
    }

    public sub(p: Point){
        return new Point(this.x - p.x, this.y - p.y);
    }

    public mult(by: number): Point {
        return new Point(this.x * by, this.y * by);
    }

    public round(){
        return new Point(Math.round(this.x), Math.round(this.y));
    }

    constructor (x: number, y:number){
        this.x = x;
        this.y = y;
    }
}
