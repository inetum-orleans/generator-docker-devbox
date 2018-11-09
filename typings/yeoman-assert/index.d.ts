declare module 'yeoman-assert' {
  /**
   * Assert that a file exists
   * @param {String}       path     - path to a file
   * @example
   * assert.file('templates/user.hbs');
   */
  export function file (path: string): void

  /**
   * Assert that each files in the array exists
   * @param {Array}         paths    - an array of paths to files
   * @example
   * assert.file(['templates/user.hbs', 'templates/user/edit.hbs']);
   */
  export function file (paths: string[]): void

  /**
   * Assert that a file doesn't exist
   * @param {String}       file     - path to a file
   * @example
   * assert.noFile('templates/user.hbs');
   */

  export function noFile (file: string): void

  /**
   * Assert that each of an array of files doesn't exist
   * @param {Array}         pairs    - an array of paths to files
   * @example
   * assert.noFile(['templates/user.hbs', 'templates/user/edit.hbs']);
   */

  export function noFile (pairs: [string, string][]): void

  /**
   * Assert that a file's content matches a regex or string
   * @param {String}       file     - path to a file
   * @param {RegExp|String} reg      - regex / string that will be used to search the file
   * @example
   * assert.fileContent('models/user.js', /App\.User = DS\.Model\.extend/);
   * assert.fileContent('models/user.js', 'App.User = DS.Model.extend');
   */
  export function fileContent (file: string[], reg: string | RegExp): void

  /**
   * Assert that each file in an array of file-regex pairs matches its corresponding regex
   * @param {Array}         pairs    - an array of arrays, where each subarray is a [String, RegExp] pair
   * @example
   * var arg = [
   *   [ 'models/user.js', /App\.User = DS\.Model\.extend/ ],
   *   [ 'controllers/user.js', /App\.UserController = Ember\.ObjectController\.extend/ ]
   * ]
   * assert.fileContent(arg);
   */
  export function fileContent (pairs: [string, RegExp][]): void


  /**
   * Assert that a file's content is the same as the given string
   * @param {String}  file            - path to a file
   * @param {String}  expectedContent - the expected content of the file
   * @example
   * assert.equalsFileContent(
   *   'data.js',
   *   'const greeting = "Hello";\nexport default { greeting }'
   * );
   */
  export function equalsFileContent (file: string, expectedContent: string): void

  /**
   * Assert that each file in an array of file-string pairs equals its corresponding string
   * @param {Array}   pairs           - an array of arrays, where each subarray is a [String, String] pair
   * @example
   * assert.equalsFileContent([
   *   ['data.js', 'const greeting = "Hello";\nexport default { greeting }'],
   *   ['user.js', 'export default {\n  name: 'Coleman',\n  age: 0\n}']
   * ]);
   */
  export function equalsFileContent (pairs: [string, string][]): void

  /**
   * Assert that a file's content does not match a regex / string
   * @param {String}       file     - path to a file
   * @param {RegExp|String} reg      - regex / string that will be used to search the file
   * @example
   * assert.noFileContent('models/user.js', /App\.User = DS\.Model\.extend/);
   * assert.noFileContent('models/user.js', 'App.User = DS.Model.extend');
   */

  export function noFileContent (file: string, reg: RegExp | string): void

  /**
   * Assert that each file in an array of file-regex pairs does not match its corresponding regex
   * @param {Array}         pairs    - an array of arrays, where each subarray is a [String, RegExp] pair
   * var arg = [
   *   [ 'models/user.js', /App\.User \ DS\.Model\.extend/ ],
   *   [ 'controllers/user.js', /App\.UserController = Ember\.ObjectController\.extend/ ]
   * ]
   * assert.noFileContent(arg);
   */

  export function noFileContent (pairs: [string, RegExp][]): void


  /**
   * Assert that two strings are equal after standardization of newlines
   * @param {String} value    - a string
   * @param {String} expected - the expected value of the string
   * @example
   * assert.textEqual('I have a yellow cat', 'I have a yellow cat');
   */
  export function textEqual (value: string, expected: string): void

  /**
   * Assert an Object implements an interface
   * @param {Object}       subject - subject implementing the façade
   * @param {Object|Array} methods - a façace, hash or array of keys to be implemented
   */
  export function implement (subject: object, methods: object | object[]): void

  /**
   * Assert an Object doesn't implements any method of an interface
   * @param {Object}       subject - subject not implementing the methods
   * @param {Object|Array} methods - hash or array of method names to be implemented
   */
  export function notImplement (subject: object, methods: object | object[]): void

  /**
   * Assert an object contains the provided keys
   * @param {Object} obj      Object that should match the given pattern
   * @param {Object} content  An object of key/values the object should contains
   */

  export function objectContent (obj: object, content: object): void

  /**
   * Assert an object does not contain the provided keys
   * @param {Object} obj Object that should not match the given pattern
   * @param {Object} content An object of key/values the object should not contain
   */

  export function noObjectContent (obj: object, content: object): void

  /**
   * Assert a JSON file contains the provided keys
   * @param {String} filename
   * @param {Object} content An object of key/values the file should contains
   */

  export function JSONFileContent (filename: object, content: object): void

  export function jsonFileContent (filename: object, content: object): void

  /**
   * Assert a JSON file does not contain the provided keys
   * @param {String} filename
   * @param {Object} content An object of key/values the file should not contain
   */
  export function noJSONFileContent (filename: object, content: object): void

  export function noJsonFileContent (filename: object, content: object): void

}
