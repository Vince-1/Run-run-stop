import { DataSet, parseDA, parseDicom } from 'dicom-parser';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

interface DicomTag {
  keyword: string;
  tag: string;
  valueRepresentation: ValueRepresentation;
  length: number;
}
export enum ValueRepresentation {
  codeString = 'CS',
  unsignedShort = 'US',
  integerString = 'IS',
  decimalString = 'DS',
  otherWord = 'OB', // for pixelData
  uniqueIdentifier = 'UI',
}

export enum PixelRepresentation {
  unsigned = 0,
  signed = 1,
}

export type BitStored = 8 | 16 | 32; // TODO: foat?int?

export interface InfoConcernDicom {
  modality: 'CT' | 'PET'; // for now
  rows: number;
  columns: number;
  numberOfFrames: number;
  instanceNumber: number;
  windowCenter: number;
  windowWidth: number;
  sliceLocation: number;
  imagePosition: [number, number, number];
  pixelSpacing: [number, number];
  sliceThickness: number;
  bitStored: BitStored;
  pixelRepresentation: PixelRepresentation;
  pixelData: Uint8Array; // arraybuffer
  seriesInstanceUID: string;
}
export const imageInfoConcernDicomTag: DicomTag[] = [
  // referen from dicom standard browser: https://dicom.innolitics.com/ciods
  {
    keyword: 'modality',
    tag: 'x00080060',
    valueRepresentation: ValueRepresentation.codeString,
    length: 1,
  },
  {
    keyword: 'rows',
    tag: 'x00280010',
    valueRepresentation: ValueRepresentation.unsignedShort,
    length: 1,
  },
  {
    keyword: 'columns',
    tag: 'x00280011',
    valueRepresentation: ValueRepresentation.unsignedShort,
    length: 1,
  },
  {
    keyword: 'numberOfFrames',
    tag: 'x00280008',
    valueRepresentation: ValueRepresentation.integerString,
    length: 1,
  },

  {
    keyword: 'instanceNumber',
    tag: 'x00200013',
    valueRepresentation: ValueRepresentation.integerString,
    length: 1,
  },

  {
    keyword: 'windowCenter',
    tag: 'x00281050',
    valueRepresentation: ValueRepresentation.decimalString,
    length: 1,
  },
  {
    keyword: 'windowWidth',
    tag: 'x00281051',
    valueRepresentation: ValueRepresentation.decimalString,
    length: 1,
  },

  {
    keyword: 'sliceLocation',
    tag: 'x00201041',
    valueRepresentation: ValueRepresentation.decimalString,
    length: 1,
  },
  {
    keyword: 'imagePosition',
    tag: 'x00200032',
    valueRepresentation: ValueRepresentation.decimalString,
    length: 3,
  },

  {
    keyword: 'pixelSpacing',
    tag: 'x00280030',
    valueRepresentation: ValueRepresentation.decimalString,
    length: 2,
  },
  {
    keyword: 'sliceThicknetss',
    tag: 'x00180050',
    valueRepresentation: ValueRepresentation.decimalString,
    length: 1,
  },

  {
    keyword: 'bitStored',
    tag: 'x00280101',
    valueRepresentation: ValueRepresentation.unsignedShort,
    length: 1,
  },
  {
    keyword: 'pixelRepresentation',
    tag: 'x00280103',
    valueRepresentation: ValueRepresentation.unsignedShort,
    length: 1,
  },
  {
    keyword: 'pixelData',
    tag: 'x7fe00010',
    valueRepresentation: ValueRepresentation.otherWord,
    length: 1,
  },
  {
    keyword: 'seriesInstanceUID',
    tag: 'x0020000e',
    valueRepresentation: ValueRepresentation.uniqueIdentifier,
    length: 1,
  },
];

// export function getDataByVR(vr: ValueRepresentation, d: DataSet) {
//   console.log(d);
//   switch (vr) {
//     case ValueRepresentation.codeString:
//       return d.string;
//     case ValueRepresentation.unsignedShort:
//       return d.int16;
//     case ValueRepresentation.integerString:
//       return d.int16;
//     case ValueRepresentation.decimalString:
//       return d.int16;
//   }
// }

export function getDataByVR(
  vr: ValueRepresentation,
  d: DataSet,
  tag: string,
  length = 1
) {
  switch (vr) {
    case ValueRepresentation.codeString:
    case ValueRepresentation.uniqueIdentifier:
      return fToArrays((i: number) => d.string(tag, i), length);
    case ValueRepresentation.unsignedShort:
      return fToArrays((i: number) => d.int16(tag, i), length);
    case ValueRepresentation.integerString:
      return fToArrays((i: number) => d.intString(tag, i), length);
    case ValueRepresentation.decimalString:
      return fToArrays((i: number) => d.floatString(tag, i), length);
    case ValueRepresentation.otherWord:
      return d.byteArray.slice(d.elements[tag].dataOffset);
  }
}

function fToArrays<T>(f: (index: number) => T, length: number): T | T[] {
  return length === 1
    ? f(0)
    : length > 1
    ? new Array(length).fill(0).map((value, index) => {
        return f(index);
      })
    : f(0);
}

export function getDataType(p: PixelRepresentation, b: BitStored) {
  switch (b) {
    case 8:
      return p === PixelRepresentation.unsigned ? Uint8Array : Int8Array;
    case 16:
      return p === PixelRepresentation.unsigned ? Uint16Array : Int16Array;
    case 32:
      return p === PixelRepresentation.unsigned ? Uint32Array : Int32Array;
  }
}

export function dicomFileReaderOnload<T>(f: (info?: T) => void) {
  return (e: ProgressEvent<FileReader>) => {
    console.log('file load: ', e);
    const buffer = e.target.result;
    if (typeof buffer === 'string') {
      console.warn(buffer);
    } else {
      const dataSet = parseDicom(new Uint8Array(buffer));
      console.log(dataSet);

      const r = {};
      imageInfoConcernDicomTag.forEach((item) => {
        r[item.keyword] = getDataByVR(
          item.valueRepresentation,
          dataSet,
          item.tag,
          item.length
        );
      });
      const info = r as T;
      f(info);
    }
  };
}

export function parseData<T>() {
  return (e: ProgressEvent<FileReader>) => {
    console.log('file load: ', e);
    const buffer = e.target.result;
    if (typeof buffer === 'string') {
      console.warn(buffer);
      throw Error(buffer);
    } else {
      const dataSet = parseDicom(new Uint8Array(buffer));
      console.log(dataSet);
      const r = {};
      imageInfoConcernDicomTag.forEach((item) => {
        r[item.keyword] = getDataByVR(
          item.valueRepresentation,
          dataSet,
          item.tag,
          item.length
        );
      });
      const info = r as T;

      return info;
    }
  };
}

export function dicomReader<T>(dealFunc: (i: T) => void) {
  const reader = new FileReader();
  reader.onabort = (e: ProgressEvent<FileReader>) => {
    console.warn(`file reading aborted: ${e}`);
  };
  reader.onerror = (e: ProgressEvent<FileReader>) => {
    console.warn(`file reading was wrong: ${e}`);
  };
  reader.onload = dicomFileReaderOnload(dealFunc);
  return reader;
}

export function dicomReader2<T>(b: Blob) {
  const reader = new FileReader();

  const subject = new Subject<T>();
  const action = new Subject<ProgressEvent<FileReader>>();

  reader.onload = (e) => action.next(e);
  reader.onabort = (e) => action.error(e);
  reader.onerror = (e) => action.error(e);
  reader.onloadend = (e) => action.complete();

  action.pipe(map(parseData<T>())).subscribe(subject);

  reader.readAsArrayBuffer(b);
  return subject.asObservable();
}

export function dicomReader3(b: Blob) {
  const r = new Observable<ProgressEvent<FileReader>>((o) => {
    const reader3 = new FileReader();
    reader3.onload = (e) => o.next(e);
    reader3.onabort = (e) => o.error(e);
    reader3.onerror = (e) => o.error(e);
    reader3.onloadend = () => o.complete();
    reader3.readAsArrayBuffer(b);
    return () => reader3.abort();
  });
  return r;
}
