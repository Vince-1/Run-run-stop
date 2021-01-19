import { Component, OnInit } from '@angular/core';
import { combineLatest, fromEvent, interval } from 'rxjs';
import { buffer, scan } from 'rxjs/operators';
import { initGame } from '../share/game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less'],
})
export class GameComponent implements OnInit {
  game = initGame();
  period = 0.1;
  get gameJson() {
    return JSON.stringify(
      {
        ...this.game,
        chapterMap: { ...this.game.chapterMap, array: [] },
      },
      null,
      1
    );
  }

  constructor() {}

  ngOnInit(): void {
    // combineLatest(fromEvent(window, 'keydown'), interval(100)).
    // subscribe(
    //   ([event, time]: [KeyboardEvent, number]) => {
    //     switch (true) {
    //       case event.keyCode === 97:
    //         this.gameInit();
    //         break;
    //       case event.keyCode === 98:
    //         this.gameStart();
    //         break;
    //       case event.keyCode === 99:
    //         this.gamePause();
    //         break;
    //       case event.keyCode === 100 ||
    //         time === 600 ||
    //         this.game.mario.x === 500:
    //         this.gameOver();
    //         break;
    //       case event.keyCode === 65:
    //         this.left();
    //         break;
    //       case event.keyCode === 68:
    //         this.right();
    //         break;
    //       case event.keyCode === 87:
    //         this.up();
    //         break;
    //       case event.keyCode === 83:
    //         this.down();
    //         break;
    //     }
    //     this.compute(time * 0.1);
    //   },
    //   (e) => console.error(e)
    // );
    // fromEvent(window, 'keydown').subscribe(
    //   (x: KeyboardEvent) => console.log(x),
    //   (e) => console.error(e)
    // );
    const time = interval(1000 * this.period);
    fromEvent(window, 'keydown')
      .pipe(
        buffer(time)
        // scan(
        //   (
        //     account: { events: KeyboardEvent[]; time: number },
        //     current: KeyboardEvent[]
        //   ) => ({
        //     events: current,
        //     time: account.time + 1,
        //   }),
        //   { events: [], time: 0 }
        // )
      )
      .subscribe(
        (k: KeyboardEvent[]) => {
          switch (true) {
            case k.length === 0:
              this.none();
              break;
            case k[0].keyCode === 97:
              this.gameInit();
              break;
            case k[0].keyCode === 98:
              this.gameStart();
              break;
            case k[0].keyCode === 99:
              this.gamePause();
              break;
            case k[0].keyCode === 100 ||
              this.game.time > 600 ||
              this.game.mario.x > 500:
              this.gameOver();
              break;

            case k[0].keyCode === 65:
              this.left();
              break;
            case k[0].keyCode === 68:
              this.right();
              break;
            case k[0].keyCode === 87:
              this.up();
              break;
            case k[0].keyCode === 83:
              this.down();
              break;
          }

          if (this.game.state === 'running') {
            this.compute();
          }
        },
        (e) => console.error(e)
      );

    // fromEvent(window, 'keydown')
    //   .pipe(buffer(interval(100)))
    //   .subscribe(
    //     (x) => console.log(x),
    //     (e) => console.error(e)
    //   );
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
  none() {
    this.game.mario.accelerationX =
      this.game.mario.velocityX > 0
        ? -1
        : this.game.mario.velocityX < 0
        ? 1
        : 0;
    this.game.mario.accelerationY = this.game.mario.velocityY > 0 ? -1 : 0;
  }
  compute() {
    // const this.period = timeNow - this.game.time;
    // this.period = this.period;
    this.game.mario.velocityX = this.game.mario.getVelocity(
      this.game.mario.accelerationX,
      this.period,
      this.game.mario.velocityX
    );
    this.game.mario.velocityY = this.game.mario.getVelocity(
      this.game.mario.accelerationY,
      this.period,
      this.game.mario.velocityY
    );
    this.game.mario.x = this.game.mario.getMotion(
      this.game.mario.velocityX,
      this.period,
      this.game.mario.x
    );
    this.game.mario.y = this.game.mario.getMotion(
      this.game.mario.velocityY,
      this.period,
      this.game.mario.y
    );
    this.game.time += this.period;
  }
}
