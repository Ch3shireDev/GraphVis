import { Component, OnInit, HostListener } from '@angular/core';
import { Circle, Line, Stroke } from 'angular-svg';

class CircleData {
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
    this.hideHandler();
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

  // public updateChildPosition(child: CircleData) {
  //   console.log('updating children');
  //   this.linesFrom.forEach((line) => {
  //     console.log(line);
  //     if (line.child === child) {
  //       line.x2 = child.cx;
  //       line.y2 = child.cy;
  //     }
  //   });
  // }

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
    AppComponent.singleton.currentCircle = this;
  }

  public handlerMouseUp(event) {
    const x = event.x - AppComponent.singleton.x0;
    const y = event.y - AppComponent.singleton.y0;
    this.handlerDrop(x, y);
  }

  public handlerDrop(x, y) {
    if (!this.isHandlerGrabbed) {
      return;
    }
    AppComponent.singleton.currentCircle = null;
    this.handler = null;
    this.isHandlerGrabbed = false;
    this.line = null;

    const closestCircle = AppComponent.singleton.findClosestCircle(x, y);
    if (closestCircle === null) {
      return;
    }
    const dist = closestCircle.dist(x, y);

    if (dist < 50) {
      if (this.children.includes(closestCircle)) {
        return;
      }

      const line = {
        x1: this.cx,
        y1: this.cy,
        x2: closestCircle.cx,
        y2: closestCircle.cy,
        stroke: new Stroke('red', 'black', 0, 5, 1),
        child: closestCircle,
      };

      this.linesFrom.push(line);
      this.children.push(closestCircle);
      closestCircle.parents.push(this);
      closestCircle.linesTo.push(line);
    }
  }

  public hideHandler() {
    if (this.isHandlerGrabbed) {
      return;
    }
    this.handler = null;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor() {
    AppComponent.singleton = this;
  }
  public static singleton: any;

  public circle: CircleData;

  isElementClicked = false;

  isCanvasClicked: boolean;

  public viewBox = '0 0 1000 800';

  x: number;
  y: number;

  x0 = 0;
  x1 = 1600;
  y0 = 0;
  y1 = 800;

  public mouseX0 = 0;
  public mouseY0 = 0;

  public X0 = 0;
  public Y0 = 0;

  circles: CircleData[];

  public currentCircle: CircleData;

  defaultStroke = new Stroke('red', 'black', 0, 5, 1);

  // closestCircle: CircleData;

  ngOnInit() {
    this.circles = [
      new CircleData(window.innerWidth / 2, window.innerHeight / 2),
    ];

    $('#svg-canvas').attr(
      'viewBox',
      `${this.x0} ${this.y0} ${this.x1} ${this.y1}`
    );

    this.circles.push(new CircleData(200, 200));

    this.windowUpdate();
  }

  public mousedown(event): void {
    const cx0 = event.target.attributes.cx.value;
    const cy0 = event.target.attributes.cy.value;

    this.circles.forEach((element) => {
      if (element.cx == cx0 && element.cy == cy0) {
        this.circle = element;
      }
    });

    this.isElementClicked = true;
  }

  public mouseup(event): void {
    this.isElementClicked = false;
    if (this.currentCircle) {
      this.currentCircle.handlerMouseUp(event);
      this.currentCircle = null;
    }
  }

  canvasDblClick(event): void {
    this.circles.push(new CircleData(event.layerX, event.layerY));
  }

  public findClosestCircle(x, y): CircleData {
    let circle = this.circles[0];
    let distMin = 99999;
    this.circles.forEach((element) => {
      const x0 = element.cx;
      const y0 = element.cy;
      const dist = (x0 - x) * (x0 - x) + (y0 - y) * (y0 - y);

      if (dist < distMin) {
        circle = element;
        distMin = dist;
      }
    });

    return circle;
  }

  get closestCircle(): CircleData {
    return this.findClosestCircle(this.x, this.y);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    this.x = e.layerX + this.x0;
    this.y = e.layerY + this.y0;
    const x = this.x;
    const y = this.y;

    if (this.currentCircle) {
      this.currentCircle.moveHandler(x, y);
    }

    if (e.buttons !== 1) {
      if (this.currentCircle) {
        this.currentCircle.handlerDrop(x, y);
      }
      const dist = this.closestCircle.dist(x, y);
      if (dist > 50 && dist < 120) {
        this.closestCircle.showHandler(x, y);
      } else {
        this.closestCircle.hideHandler();
      }
      return;
    }
    if (this.isElementClicked) {
      this.circle.setPosition(x, y);
      return;
    }
    if (this.isCanvasClicked) {
      const dx = e.layerX - this.mouseX0;
      const dy = e.layerY - this.mouseY0;

      this.x0 = this.X0 - dx / 2;
      this.y0 = this.Y0 - dy / 2;

      this.windowUpdate();
    }
  }

  windowUpdate() {
    this.x1 = window.innerWidth;
    this.y1 = window.innerHeight;

    $('#svg-canvas').attr(
      'viewBox',
      `${this.x0} ${this.y0} ${this.x1} ${this.y1}`
    );
  }

  svgMouseDown(e) {
    if (e.target.nodeName !== 'svg') {
      return;
    }

    this.isCanvasClicked = true;
    this.mouseX0 = e.layerX;
    this.mouseY0 = e.layerY;
    this.X0 = this.x0;
    this.Y0 = this.y0;
  }

  svgMouseUp(e) {
    this.isCanvasClicked = false;
    const x = e.layerX + this.x0;
    const y = e.layerY + this.y0;
  }
}
