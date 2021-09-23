type Person = { age: number; name: string; alive: boolean };
type Age = Person['age'];

// type Age = number

type I1 = Person['age' | 'name'];

// type I1 = string | number

type I2 = Person[keyof Person];

// type I2 = string | number | boolean

type AliveOrName = 'alive' | 'name';
type I3 = Person[AliveOrName];

// type I3 = string | boolean

const MyArray = [
  { name: 'Alice', age: 15 },
  { name: 'Bob', age: 23 },
  { name: 'Eve', age: 38 },
];

type Person2 = typeof MyArray[number];

// type Person2 = {
//   name: string;
//   age: number;
// };
type Age2 = typeof MyArray[number]['age'];

// type Age = number;
// Or
type Age3 = Person2['age'];

// type Age3 = number;

// const key = "age";
// type Age4 = Person2[key];
// Type 'any' cannot be used as an index type.
// 'key' refers to a value, but is being used as a type here. Did you mean 'typeof key'?

type key = "age";
type Age4 = Person[key];