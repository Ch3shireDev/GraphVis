import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {
  SvgCircleModule,
  SvgLineModule,
  SvgPolygonModule,
  SvgPolylineModule,
  SvgTextModule,
  SvgPathModule,
  SvgEllipseModule,
} from 'angular-svg';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    SvgCircleModule,
    SvgLineModule,
    SvgPolygonModule,
    SvgPolylineModule,
    SvgTextModule,
    SvgPathModule,
    SvgEllipseModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
