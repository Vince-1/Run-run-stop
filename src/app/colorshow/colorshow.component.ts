import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-colorshow',
  templateUrl: './colorshow.component.html',
  styleUrls: ['./colorshow.component.less']
})
export class ColorshowComponent implements OnInit {
  RGBr= 100;
  //  elem = document.getElementById("mo-color-thumb");
  //  target = document.querySelector('.value');
  RGBg = 100;
  RGBb=100;
  RGBr1= 100;
  //  elem = document.getElementById("mo-color-thumb");
  //  target = document.querySelector('.value');
  RGBg1 = 100;
  RGBb1=100;

 rgb_hsv = () =>{
    console.log(111);
  }
  rgbchange = (a:number,b:number,c:number)=>{
    this.RGBr=a;this.RGBg=b;this.RGBb=c;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
