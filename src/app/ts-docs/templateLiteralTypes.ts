type World = 'world';

type Greeting = `hello ${World}`;

// type Greeting = "hello world"

type EmailLocaleIDs = 'welcome_email' | 'email_heading';
type FooterLocaleIDs = 'footer_title' | 'footer_sendoff';

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;

// type AllLocaleIDs =
//   | 'welcome_email_id'
//   | 'email_heading_id'
//   | 'footer_title_id'
//   | 'footer_sendoff_id';

type Lang = 'en' | 'ja' | 'pt';

type LocaleMessageIDs = `${Lang}_${AllLocaleIDs}`;

// type LocaleMessageIDs =
//   | 'en_welcome_email_id'
//   | 'en_email_heading_id'
//   | 'en_footer_title_id'
//   | 'en_footer_sendoff_id'
//   | 'ja_welcome_email_id'
//   | 'ja_email_heading_id'
//   | 'ja_footer_title_id'
//   | 'ja_footer_sendoff_id'
//   | 'pt_welcome_email_id'
//   | 'pt_email_heading_id'
//   | 'pt_footer_title_id'
//   | 'pt_footer_sendoff_id';

const person = makeWatchedObject({
  firstName: 'Saoirse',
  lastName: 'Ronan',
  age: 26,
});

person.on('firstNameChanged', (newValue) => {
  console.log(`firstName was changed to ${newValue}!`);
});

type PropEventSource<Type> = {
  on(
    eventName: `${string & keyof Type}Changed`,
    callback: (newValue: any) => void
  ): void;
};

/// Create a "watched object" with an 'on' method
/// so that you can watch for changes to properties.
declare function makeWatchedObject<Type>(
  obj: Type
): Type & PropEventSource<Type>;

const person = makeWatchedObject({
  firstName: 'Saoirse',
  lastName: 'Ronan',
  age: 26,
});

person.on('firstNameChanged', () => {});

// It's typo-resistent
person.on('firstName', () => {});
//         Argument of type '"firstName"' is not assignable to parameter of type '"firstNameChanged" | "lastNameChanged" | "ageChanged"'.

person.on('frstNameChanged', () => {});
//         Argument of type '"frstNameChanged"' is not assignable to parameter of type '"firstNameChanged" | "lastNameChanged" | "ageChanged"'.

type PropEventSource<Type> = {
  on<Key extends string & keyof Type>(
    eventName: `${Key}Changed`,
    callback: (newValue: Type[Key]) => void
  ): void;
};

declare function makeWatchedObject<Type>(
  obj: Type
): Type & PropEventSource<Type>;

const person = makeWatchedObject({
  firstName: 'Saoirse',
  lastName: 'Ronan',
  age: 26,
});

person.on('firstNameChanged', (newName) => {
  //       (parameter) newName: string
  console.log(`new name is ${newName.toUpperCase()}`);
});

person.on('ageChanged', (newAge) => {
  //       (parameter) newAge: number
  if (newAge < 0) {
    console.warn('warning! negative age');
  }
});

type Greeting = 'Hello, world';
type ShoutyGreeting = Uppercase<Greeting>;

// type ShoutyGreeting = "HELLO, WORLD"

type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`;
type MainID = ASCIICacheKey<'my_app'>;

// type MainID = "ID-MY_APP"

type Greeting = 'Hello, world';
type QuietGreeting = Lowercase<Greeting>;

// type QuietGreeting = "hello, world"

type ASCIICacheKey<Str extends string> = `id-${Lowercase<Str>}`;
type MainID = ASCIICacheKey<'MY_APP'>;

// type MainID = "id-my_app"
type LowercaseGreeting = 'hello, world';
type Greeting = Capitalize<LowercaseGreeting>;

// type Greeting = "Hello, world"

type UppercaseGreeting = 'HELLO WORLD';
type UncomfortableGreeting = Uncapitalize<UppercaseGreeting>;

// type UncomfortableGreeting = "hELLO WORLD"
