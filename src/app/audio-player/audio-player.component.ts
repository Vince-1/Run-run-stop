import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.less']
})
export class AudioPlayerComponent implements OnInit {
  a = new Audio()
  constructor() { }

  ngOnInit(): void {
  }

}
