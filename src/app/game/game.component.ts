import { Component, OnInit } from '@angular/core';
import { combineLatest, fromEvent, interval } from 'rxjs';
import { initGame } from '../share/game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less'],
})
export class GameComponent implements OnInit {
  game = initGame();
  get gameJson() {
    return JSON.stringify(this.game);
  }

  constructor() {}

  ngOnInit(): void {
    combineLatest(fromEvent(window, 'keydown'), interval(100)).subscribe(
      ([event, time]: [KeyboardEvent, number]) => {
        switch (true) {
          case event.keyCode === 97:
            this.gameInit();
            break;
          case event.keyCode === 98:
            this.gameStart();
            break;
          case event.keyCode === 99:
            this.gamePause();
            break;
          case event.keyCode === 100 ||
            time === 600 ||
            this.game.mario.x === 500:
            this.gameOver();
            break;
          case event.keyCode === 65:
            this.left();
          case event.keyCode === 68:
            this.right();
          case event.keyCode === 87:
            this.up();
          case event.keyCode === 83:
            this.down();
            this.compute(time);
            break;
        }
      },
      (e) => console.error(e)
    );
    fromEvent(window, 'keydown').subscribe(
      (x: KeyboardEvent) => console.log(x.keyCode),
      (e) => console.error(e)
    );
  }
  gameInit() {
    this.game = initGame();
  }
  gameStart() {
    this.game.state = 'running';
  }
  gamePause() {
    this.game.state = 'pausing';
  }
  gameOver() {
    this.game.state = 'over';
  }

  left() {
    this.game.mario.moveState = 'rushing';
    this.game.mario.orientation = 'backward';
    this.game.mario.accelerationX = -1;
  }
  right() {
    this.game.mario.moveState = 'rushing';
    this.game.mario.orientation = 'forward';
    this.game.mario.accelerationX = 1;
  }
  up() {
    this.game.mario.moveState = 'jumping';
    this.game.mario.accelerationY = 1;
  }
  down() {
    this.game.mario.moveState = 'squatting';
  }
  compute(timeNow: number) {
    const period = timeNow - this.game.time;
    this.game.mario.velocityX = this.game.mario.getVelocity(
      this.game.mario.accelerationX,
      period,
      this.game.mario.velocityX
    );
    this.game.mario.velocityY = this.game.mario.getVelocity(
      this.game.mario.accelerationY,
      period,
      this.game.mario.velocityY
    );
    this.game.mario.x = this.game.mario.getMotion(
      this.game.mario.velocityX,
      period,
      this.game.mario.x
    );
    this.game.mario.y = this.game.mario.getMotion(
      this.game.mario.velocityY,
      period,
      this.game.mario.y
    );
    this.game.time = timeNow;
  }
}
