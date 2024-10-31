import {Blah} from 'blah';

const URL = `http://app.com/?dev=${DEV}`;

/**
 * @link Hello
 */
class Foo extends Bar {
  constructor() {
    // init foo
    this.foo = 15;
    this.run();
  }

  /**
   * Run the given bar
   * @param {string} bar A bar to run.
   */
  run(bar) {
    let a = $.ajax({
      url: URL,
      data: {
        bar: 'hey there',
        items: [1, 2, 3]
      }
    }).then(result => {
      console.log(result.match(/regex/i));
    });
  }
}
