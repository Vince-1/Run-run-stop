import { fromEvent } from 'rxjs';

export function keyBoard(element: HTMLElement) {
    fromEvent(element, 'keyup').subscribe(
        (x) => console.log(x),
        (e) => console.error(e)
    );
}
