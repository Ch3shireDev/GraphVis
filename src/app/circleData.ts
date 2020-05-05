import { Stroke, Line } from 'angular-svg';
import { CircleList } from './circleList';

export class CircleData {
  public cx: number;
  public cy: number;
  public r: number;
  public stroke: Stroke;
  public handler: any;
  public isHandlerGrabbed: any;
  public line: Line;
  public connections = [];
  public linesFrom = [];
  public linesTo = [];
  public children: CircleData[] = [];
  public parents: CircleData[] = [];

  vx = 0;
  vy = 0;

  get x() { return CircleList.x; }

  get y() { return CircleList.y; }

  public constructor(
    x,
    y,
    r = 50,
    stroke = new Stroke('red', 'black', 0, 5, 1)
  ) {
    this.cx = x;
    this.cy = y;
    this.r = r;
    this.stroke = stroke;
  }

  public moveHandler(x, y) {
    if (!this.isHandlerGrabbed) {
      return;
    }
    this.handler.cx = x;
    this.handler.cy = y;

    this.line = {
      x1: this.cx,
      y1: this.cy,
      x2: x,
      y2: y,
      stroke: new Stroke('red', 'black', 0, 5, 1),
    };
  }

  public dist(x, y) {
    const dx = this.cx - x;
    const dy = this.cy - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public setPosition(x, y) {
    this.cx = x;
    this.cy = y;

    this.linesFrom.forEach((line) => {
      line.x1 = x;
      line.y1 = y;
    });

    this.linesTo.forEach((line) => {
      line.x2 = x;
      line.y2 = y;
    });
  }

  public calculateDynamics(dt: number) {
    const alpha = 10;
    const beta1 = 2;
    const beta3 = 1;
    let ax = 0;
    let ay = 0;

    this.parents.forEach((element) => {
      const dx = this.cx - element.cx;
      const dy = this.cy - element.cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      const force = len - 400;
      ax += (-alpha * (force * dx)) / len;
      ay += (-alpha * (force * dy)) / len;
    });

    // ax -= this.vx * beta1 * dt;
    // ay -= this.vy * beta1 * dt;

    this.vx = 0;
    this.vy = 0;

    this.vx += ax * dt;
    this.vy += ay * dt;
    this.vx *= Math.exp(-beta3 * dt);
    this.vy *= Math.exp(-beta3 * dt);
    // const a2 = (ax * ax + ay * ay) / 10000000;
    // if (a2 > 0) {
    // this.vx *= Math.exp(-a2 * dt);
    // this.vy *= Math.exp(-a2 * dt);
    // return;
    // }
    // if (this.vx * this.vx + this.vy * this.vy < 15) {
    //   this.vx = 0;
    //   this.vy = 0;
    // }
  }

  public updateDynamics(dt: number) {
    this.setPosition(this.cx + this.vx * dt, this.cy + this.vy * dt);
  }

  public showHandler(x, y) {
    const vec = { x: x - this.cx, y: y - this.cy };
    const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    vec.x *= (this.r + 20) / len;
    vec.y *= (this.r + 20) / len;
    this.handler = {
      cx: this.cx + vec.x,
      cy: this.cy + vec.y,
      r: 20,
      stroke: new Stroke('red', 'black', 0, 5, 1),
    };
  }

  public handlerMouseDown(event) {
    this.isHandlerGrabbed = true;
    CircleList.currentCircle = this;
  }

  public handlerMouseUp(event) {
    this.handlerDrop(this.x, this.y);
  }

  public setChild(child: CircleData) {
    const line = {
      x1: this.cx,
      y1: this.cy,
      x2: child.cx,
      y2: child.cy,
      stroke: new Stroke('red', 'black', 0, 5, 1),
      child,
    };

    this.linesFrom.push(line);
    this.children.push(child);
    child.parents.push(this);
    child.linesTo.push(line);
  }

  public handlerDrop(x, y) {
    if (!this.isHandlerGrabbed) {
      return;
    }
    CircleList.currentCircle = null;
    this.handler = null;
    this.isHandlerGrabbed = false;
    this.line = null;

    const closestCircle = CircleList.findClosestCircle(x, y);
    if (closestCircle === null) {
      return;
    }
    const dist = closestCircle.dist(x, y);

    if (dist < 50) {
      if (this.children.includes(closestCircle)) {
        return;
      }
      this.setChild(closestCircle);
    }
  }

  public hideHandler() {
    if (this.isHandlerGrabbed) {
      return;
    }
    this.handler = null;
  }
}
