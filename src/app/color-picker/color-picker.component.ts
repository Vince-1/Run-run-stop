import { OnInit, Component, Output, Input, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Observable, fromEvent, Subject } from 'rxjs';
@Component({
    selector: 'color-picker',
    styleUrls: ['./color-picker.component.scss'],
    templateUrl: './color-picker.component.html'
})
export class ColorPicker implements OnInit {
    a = 0;
    //  elem = document.getElementById("mo-color-thumb");
    //  target = document.querySelector('.value');
    colorthumbX = null;
    colorthumbY = null;
    R = null;
    R1 = new Subject<number>();
    @Input() set rgbr(a: number) {
        this.R = a;
        this.R1.next(a);
    }
    @Input() set rgbg(a: number) {
        this.G = a;
        this.R1.next(a);
    }
    @Input() set rgbb(a: number) {
        this.B = a;
        this.R1.next(a);
    }
    @Input() rgbchange?: (a:number,b:number,c:number) =>void;
  
    G = null;
    B = null;
    H = null;
    S = null;
    V = null;
    HSL_H = null;
    HSL_S = null;
    HSL_L = null;


    move?: Observable<Event>;
    movealpha?: Observable<Event>;
    ngOnInit() {

        let showelem = document.getElementById("mo-color-sat-val1");
        let canvaselem = document.getElementById("mo-color-sat-val");
        let elem = document.getElementById("mo-color-thumb");
        let b = elem.getBoundingClientRect();

        let pickcolorelem = document.getElementById("mo-color-hue");
        let colorlength = pickcolorelem.getBoundingClientRect().right - pickcolorelem.getBoundingClientRect().left;
        let elem1 = document.getElementById("mo-color-thumb1");
        let b1 = elem1.getBoundingClientRect();


        this.R1.asObservable().subscribe(

            x => {
               let var_R = ( this.R / 255 )
               let var_G = ( this.G / 255 )
               let var_B = ( this.B / 255 )
                
               let var_Min = Math.min( var_R, var_G, var_B )    //Min. value of RGB
               let var_Max = Math.max( var_R, var_G, var_B )    //Max. value of RGB
               let del_Max = var_Max - var_Min             //Delta RGB value
                
               this.V = var_Max
                
                if ( del_Max == 0 )                     //This is a gray, no chroma...
                {
                   this.H = 0;
                   this.S = 0;
                }
                else                                    //Chromatic data...
                {
                   this.S = del_Max / var_Max
                
                  let del_R = ( ( ( var_Max - var_R ) / 6 ) + ( del_Max / 2 ) ) / del_Max
                  let del_G = ( ( ( var_Max - var_G ) / 6 ) + ( del_Max / 2 ) ) / del_Max
                  let del_B = ( ( ( var_Max - var_B ) / 6 ) + ( del_Max / 2 ) ) / del_Max
                
                   if      ( var_R == var_Max ) this.H = del_B - del_G
                   else if ( var_G == var_Max ) this.H = ( 1 / 3 ) + del_R - del_B
                   else if ( var_B == var_Max ) this.H = ( 2 / 3 ) + del_G - del_R
                
                    if ( this.H < 0 ) this.H += 1
                    if ( this.H > 1 ) this.H -= 1
                    this.H=Math.round(this.H*360);
                }
                
                let h1 = this.H;
                this.HSL_H = this.H;
                this.HSL_S = (this.S * this.V / ((h1 = (2 - this.S) * this.V) < 1 ? h1 : 2 - h1)) || 0,
                    this.HSL_L = h1 / 2;
                canvaselem.style.background = `hsl(${this.H},100%,50%)`;
                showelem.style.background = `hsl(${this.HSL_H},${this.HSL_S * 100}%,${this.HSL_L * 100}%)`;

                let clientx =this.H/360 * colorlength;
                elem1.style.transform = `translate(${clientx+ b1.left - 7}px, 0px)`;
                this.colorthumbX = canvaselem.getBoundingClientRect().right - canvaselem.getBoundingClientRect().left;
                this.colorthumbY = canvaselem.getBoundingClientRect().bottom - canvaselem.getBoundingClientRect().top;
                let clientx1 = this.S*this.colorthumbX;
                let clienty1=this.V*this.colorthumbY;
                elem.style.transform = `translate(${clientx1 - 7}px, ${ canvaselem.getBoundingClientRect().bottom -canvaselem.getBoundingClientRect().top- clienty1  - 7}px)`;
                this.rgbchange(this.R,this.G,this.B);
              
                // elem.style.transform = `translate( ${x - (-2)}px, ${70}px)`;
            },
            e => console.error(e)
        );


      
        canvaselem.style.opacity = `0.8`;
       // console.log(elem.style.left);
        this.move =
            fromEvent(canvaselem, 'mousedown');
        this.move.subscribe(x => {
            let x1 = null;
            let y1 = null;
            x1 = (x as MouseEvent).clientX;
            y1 = (x as MouseEvent).clientY;
            this.colorthumbX = canvaselem.getBoundingClientRect().right - canvaselem.getBoundingClientRect().left;
            this.colorthumbY = canvaselem.getBoundingClientRect().bottom - canvaselem.getBoundingClientRect().top;
            this.S = Math.round((x1 - canvaselem.getBoundingClientRect().left) / this.colorthumbX * 100) / 100;
            this.V = Math.round((canvaselem.getBoundingClientRect().bottom - y1) / this.colorthumbY * 100) / 100;

            if (this.S == 0)
            this.R=this.G=this.B=Math.round(this.V*255);
            else{
            const h= this.H / 60;
           
            const i = Math.floor(h);
            const f = h - i;
            const p = this.V * (1 - this.S);
            const q = this.V * (1 - f * this.S);
            const t = this.V * (1 - (1 - f) * this.S);
            let r = 0, g = 0, b1 = 0;
            switch (i) {
                case 0: r = this.V; g = t; b1 = p; break;
                case 1: r = q; g = this.V; b1 = p; break;
                case 2: r = p; g = this.V; b1 = t; break;
                case 3: r = p; g = q; b1 = this.V; break;
                case 4: r = t; g = p; b1 = this.V; break;
                case 5: r = this.V, g = p, b1 = q; break;
            }
            this.R = Math.round(r * 255); this.G = Math.round(g * 255); this.B = Math.round(b1 * 255);
            this.rgbchange(this.R,this.G,this.B);
        }

            //h,s,v 转h,s,l
            let h1 = this.H;
            this.HSL_H = this.H;
            this.HSL_S = (this.S * this.V / ((h1 = (2 - this.S) * this.V) < 1 ? h1 : 2 - h1)) || 0,
                this.HSL_L = h1 / 2;
            console.log("H:", this.HSL_H, "S:", this.HSL_S, "L:", this.HSL_L);

          
            // console.log(r,g,b1);
            showelem.style.background = `hsl(${this.HSL_H},${this.HSL_S * 100}%,${this.HSL_L * 100}%)`;
            // console.log(elem.getBoundingClientRect());
            // console.log(x1,y1);
            console.log("R:", this.R, "G:", this.G, "B:", this.B);
            console.log("H:", this.H, "S:", this.S, "V:", this.V);
            elem.style.transform = `translate(${x1 - b.left - 7}px, ${y1 - b.top - 7}px)`;
        })
        // canvaselem.style.background = `hsl(120,100%,50%)`;






        
        this.move =
            fromEvent(pickcolorelem, 'mousedown');
        this.move.subscribe(x => {
            let x1 = null;
            let y1 = null;
            x1 = (x as MouseEvent).clientX;
            y1 = (x as MouseEvent).clientY;
            let last = Math.round((x1 - pickcolorelem.getBoundingClientRect().left) / colorlength * 360);
            this.H = last;
            canvaselem.style.background = `hsl(${last},100%,50%)`;
            // console.log(x1,y1);
            elem1.style.transform = `translate(${x1 - b1.left - 7}px, 0px)`;

        })



        let alphaelem = document.getElementById("mo-color-alpha");
        let alphalength = alphaelem.getBoundingClientRect().right - alphaelem.getBoundingClientRect().left;
        let elem2 = document.getElementById("mo-color-thumb2");
        let b2 = elem2.getBoundingClientRect();
        this.movealpha =
            fromEvent(alphaelem, 'mousedown');
        this.movealpha.subscribe(x => {
            let x1 = null;
            let y1 = null;
            x1 = (x as MouseEvent).clientX;
            y1 = (x as MouseEvent).clientY;
            let alpha = (x1 - alphaelem.getBoundingClientRect().left) / alphalength;

            console.log("opacity:", alpha);
            // console.log(x1,y1);
            elem2.style.transform = `translate(${x1 - b2.left - 7}px, 0px)`;
            canvaselem.style.opacity = `${alpha}`;
        })

    }


    change() {
        // const value = ((document.getElementById('range')) as ).value ;
        // document.getElementById('value').innerHTML = value;
    }


}