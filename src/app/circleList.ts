import { CircleData } from './circleData';
import { Circle } from 'angular-svg';

export class CircleList {

  public static currentCircle: CircleData;
  public static circles: CircleData[];
  public static x0: number;
  public static y0: number;
  public static x1: number;
  public static y1: number;
  public static x: number;
  public static y: number;


  public static findClosestCircle(x, y): CircleData {
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
}
