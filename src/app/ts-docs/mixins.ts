class Sprite {
  name = '';
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}

// To get started, we need a type which we'll use to extend
// other classes from. The main responsibility is to declare
// that the type being passed in is a class.

type Constructor = new (...args: any[]) => {};

// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:

function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Mixins may not declare private/protected properties
    // however, you can use ES2020 private fields
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}

// Compose a new class from the Sprite class,
// with the Mixin Scale applier:
const EightBitSprite = Scale(Sprite);

const flappySprite = new EightBitSprite('Bird');
flappySprite.setScale(0.8);
console.log(flappySprite.scale);

// This was our previous constructor:
// type Constructor = new (...args: any[]) => {};
// Now we use a generic version which can apply a constraint on
// the class which this mixin is applied to
type GConstructor<T = {}> = new (...args: any[]) => T;

type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;

function Jumpable<TBase extends Positionable>(Base: TBase) {
  return class Jumpable extends Base {
    jump() {
      // This mixin will only work if it is passed a base
      // class which has setPos defined because of the
      // Positionable constraint.
      this.setPos(0, 20);
    }
  };
}

// Each mixin is a traditional ES class
class Jumpable {
  jump() {}
}

class Duckable {
  duck() {}
}

// Including the base
class Sprite {
  x = 0;
  y = 0;
}

// Then you create an interface which merges
// the expected mixins with the same name as your base
interface Sprite extends Jumpable, Duckable {}
// Apply the mixins into the base class via
// the JS at runtime
applyMixins(Sprite, [Jumpable, Duckable]);

let player = new Sprite();
player.jump();
console.log(player.x, player.y);

// This can live anywhere in your codebase:
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}

// A decorator function which replicates the mixin pattern:
const Pausable = (target: typeof Player) => {
  return class Pausable extends target {
    shouldFreeze = false;
  };
};

@Pausable
class Player {
  x = 0;
  y = 0;
}

// The Player class does not have the decorator's type merged:
const player = new Player();
player.shouldFreeze;
// Property 'shouldFreeze' does not exist on type 'Player'.

// It the runtime aspect could be manually replicated via
// type composition or interface merging.
type FreezablePlayer = Player & { shouldFreeze: boolean };

const playerTwo = new Player() as unknown as FreezablePlayer;
playerTwo.shouldFreeze;

function base<T>() {
  class Base {
    static prop: T;
  }
  return Base;
}

function derived<T>() {
  class Derived extends base<T>() {
    static anotherProp: T;
  }
  return Derived;
}

class Spec extends derived<string>() {}

Spec.prop; // string
Spec.anotherProp; // string
