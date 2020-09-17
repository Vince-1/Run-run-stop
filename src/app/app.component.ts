import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'run-run-stop';
  show(value: string) {
    console.log('click');
    console.log(value);
  }
}
