import { Component, OnInit, HostListener } from '@angular/core';
import { Circle, Line, Stroke, Polygon, Vertex, Polyline } from 'angular-svg';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor() {}

  public circle: Circle;

  isElementClicked = false;

  isCanvasClicked: boolean;

  public viewBox = '0 0 1000 800';

  x0 = 0;
  x1 = 1600;
  y0 = 0;
  y1 = 800;

  public mouseX0 = 0;
  public mouseY0 = 0;

  public X0 = 0;
  public Y0 = 0;

  circles: Circle[];

  ngOnInit() {
    this.circle = {
      cx: 100,
      cy: 100,
      r: 50,
      stroke: new Stroke('red', 'black', 0, 5, 1),
    };

    this.circles = [this.circle];

    this.circle.cx = window.innerWidth / 2;
    this.circle.cy = window.innerHeight / 2;

    $('#svg-canvas').attr(
      'viewBox',
      `${this.x0} ${this.y0} ${this.x1} ${this.y1}`
    );

    this.windowUpdate();
  }

  public click(event): void {
    console.log(event);
    // this.isElementClicked = true;
  }

  public mousedown(event): void {
    console.log('mouse down');
    this.isElementClicked = true;
  }

  public mouseup(event): void {
    console.log('mouse up');
    this.isElementClicked = false;
  }

  canvasDblClick(event): void {
    this.circles.push({
      cx: event.layerX,
      cy: event.layerY,
      r: 50,
      stroke: new Stroke('red', 'black', 0, 5, 1),
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    if (e.buttons !== 1) {
      return;
    }
    if (this.isElementClicked) {
      this.circle.cx = e.layerX;
      this.circle.cy = e.layerY;
      return;
    }
    if (this.isCanvasClicked) {
      const dx = e.layerX - this.mouseX0;
      const dy = e.layerY - this.mouseY0;

      this.x0 = this.X0 + dx / 2;
      this.y0 = this.Y0 + dy / 2;

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
    this.isCanvasClicked = true;
    console.log('svg');
    this.mouseX0 = e.layerX;
    this.mouseY0 = e.layerY;
    this.X0 = this.x0;
    this.Y0 = this.y0;
  }

  svgMouseUp(e) {
    this.isCanvasClicked = false;
  }
}
