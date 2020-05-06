import { Component, OnInit, HostListener } from '@angular/core';
import { Stroke } from 'angular-svg';
import { interval } from 'rxjs';
import { CircleData } from './circleData';
import { CircleList } from './circleList';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor() { }

  public circle: CircleData;
  isElementClicked = false;
  isCanvasClicked: boolean;
  public viewBox = '0 0 1000 800';

  get x(): number {
    return CircleList.x;
  }
  set x(value: number) {
    CircleList.x = value;
  }
  get y(): number {
    return CircleList.y;
  }
  set y(value: number) {
    CircleList.y = value;
  }

  get x0(): number {
    return CircleList.x0;
  }
  set x0(value: number) {
    CircleList.x0 = value;
  }

  get y0(): number {
    return CircleList.y0;
  }
  set y0(value: number) {
    CircleList.y0 = value;
  }

  get x1(): number {
    return CircleList.x1;
  }
  set x1(value: number) {
    CircleList.x1 = value;
  }

  get y1(): number {
    return CircleList.y1;
  }
  set y1(value: number) {
    CircleList.y1 = value;
  }

  public mouseX0 = 0;
  public mouseY0 = 0;

  public X0 = 0;
  public Y0 = 0;

  get circles(): CircleData[] {
    return CircleList.circles;
  }

  set circles(value: CircleData[]) {
    CircleList.circles = value;
  }

  defaultStroke = new Stroke('red', 'black', 0, 5, 1);

  // closestCircle: CircleData;

  ngOnInit() {
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 1600;
    this.y1 = 800;

    const c1 = new CircleData(300, 300);
    const c2 = new CircleData(300, 600);
    const c3 = new CircleData(600, 300);
    const c4 = new CircleData(600, 600);
    // const c5 = new CircleData(450, 450);

    c1.setChild(c2);
    c1.setChild(c3);
    c2.setChild(c3);
    c2.setChild(c4);
    c3.setChild(c4);
    c3.setChild(c1);
    c4.setChild(c1);
    c4.setChild(c2);
    // c5.setChild(c1);
    // c5.setChild(c2);

    // this.circles = [c1, c2, c3, c4];
    this.circles = [];

    $('#svg-canvas').attr(
      'viewBox',
      `${this.x0} ${this.y0} ${this.x1} ${this.y1}`
    );

    // this.circles.push(new CircleData(200, 200));

    this.windowUpdate();

    let dt = 0.1;

    interval(1).subscribe((val) => {
      this.circles.forEach((circle) => {
        circle.resetAcceleration();
      });
      this.circles.forEach((circle) => {
        circle.calculateDynamics(dt);
      });
      this.circles.forEach((circle) => {
        circle.updateDynamics(dt);
      });
    });
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
    const circle = this.closestCircle;
    if (circle && circle.dist(this.x, this.y) < 50) { return; }

    this.circles.push(new CircleData(this.x, this.y));
  }

  get closestCircle(): CircleData {
    return CircleList.findClosestCircle(this.x, this.y);
  }

  get currentCircle(): CircleData {
    return CircleList.currentCircle;
  }

  set currentCircle(value: CircleData) {
    CircleList.currentCircle = value;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    this.x = e.layerX + this.x0;
    this.y = e.layerY + this.y0;
    const x = this.x;
    const y = this.y;

    this.circles.forEach((circle) => {
      circle.hideHandler();
    });

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

  onScroll(event) {
    alert('scroll');
  }
}
