import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as localforage from 'localforage';
import { httpInterceptorProviders } from './noop-onterceptor';

@Component({
  selector: 'app-http-concern',
  templateUrl: './http-concern.component.html',
  styleUrls: ['./http-concern.component.less'],
  providers: [httpInterceptorProviders],
})
export class HttpConcernComponent implements OnInit {
  urlArrayBuffer1 = 'assets/buffer/51ed0e9c-eaa4-415b-b6f5-581bad580410';
  urlJson = 'assets/test.json';
  urlArraybuffer2 =
    'http://master.tek-pi.com:9000/2021-08-10/51ed0e9c-eaa4-415b-b6f5-581bad580410';
  header = new HttpHeaders();

  optionJson = {
    responseType: 'json' as const,
    observe: 'events' as const,
    reportProgress: true,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'my-auth-token',
    }),

    params: new HttpParams().set('name', 'name'.trim()),
  };
  optionArrayBuffer = {
    responseType: 'arraybuffer' as const,
    observe: 'events' as const,
    reportProgress: true,
  };

  requestList = [
    { url: this.urlJson, option: this.optionJson, name: 'get json' },
    {
      url: this.urlArrayBuffer1,
      option: this.optionArrayBuffer,
      name: 'get buffer1',
    },
    {
      url: this.urlArraybuffer2,
      option: this.optionArrayBuffer,
      name: 'get buffer2',
    },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    window['localforage'] = localforage;
    // localforage.setItem('11', { id: '11', name: 'localforage' }).then(
    //   (x) => console.log(x),
    //   (e) => console.error(e)
    // );
    if (!window.indexedDB) {
      window.alert(
        `'Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.`
      );
    } else {
      const patientsData = [
        { patientId: '1', name: 'Lily', age: 18 },
        { patientId: '2', name: 'Limei', age: 15 },
        { patientId: '3', name: 'Lilei', age: 20 },
      ];
      const request = window.indexedDB.open('t', 1);
      console.log(request);

      request.onerror = (e) => console.error(e);
      request.onsuccess = (e) => console.log(e);
      request.onupgradeneeded = (event) => {
        console.log(event);
        // 为该数据库创建一个对象仓库
        const db = request.result;
        const objectStore = db.createObjectStore('patient', {
          keyPath: 'patientId',
        });
        objectStore.createIndex('patientId', 'patientId', { unique: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('age', 'age', { unique: false });

        objectStore.transaction.oncomplete = (e) => {
          const patientObjectStore = db
            .transaction('patient', 'readwrite')
            .objectStore('patient');
          patientsData.forEach((p) => patientObjectStore.add(p));
        };
      };
    }

    navigator.serviceWorker.register('assets/service-worker.js').then(
      (x) => console.log(x),
      (e) => console.error(e)
    );
    this.getRequest(this.urlArrayBuffer1, this.optionArrayBuffer);
    this.http
      .post(this.urlJson, { name: 'Mary', age: '15' }, this.optionJson)
      .subscribe(
        (x) => console.log(x),
        (e) => console.error(e)
      );
    this.http.delete(this.urlJson, this.optionJson).subscribe(
      (x) => console.log(x),
      (e) => console.error(e)
    );
  }

  getRequest(url: string, option: any) {
    this.http.get(url, option).subscribe(
      (x) => console.log(x),
      (e) => console.error(e)
    );
  }
}
