declare module 'yeoman-assert' {
  // Type definitions for yeoman-assert 3.1
  // Project: https://github.com/yeoman/yeoman-assert
  // Definitions by: Toilal <https://github.com/Toilal>
  // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
  // TypeScript Version: 2.4

  // copy/paste of node 'assert' module definitions as export * doesn't work with module.
  // tslint:disable:ban-types
  export class AssertionError implements Error {
    name: string;
    message: string;
    actual: any;
    expected: any;
    operator: string;
    generatedMessage: boolean;
    code: 'ERR_ASSERTION';

    constructor(options?: {
      message?: string; actual?: any; expected?: any;
      operator?: string; stackStartFn?: Function
    });
  }

  export function fail(message?: string | Error): never;
  export function fail(actual: any, expected: any, message?: string | Error, operator?: string, stackStartFn?: Function): never;

  export function ok(value: any, message?: string | Error): void;

  export function equal(actual: any, expected: any, message?: string | Error): void;

  export function notEqual(actual: any, expected: any, message?: string | Error): void;

  export function deepEqual(actual: any, expected: any, message?: string | Error): void;

  export function notDeepEqual(actual: any, expected: any, message?: string | Error): void;

  export function strictEqual(actual: any, expected: any, message?: string | Error): void;

  export function notStrictEqual(actual: any, expected: any, message?: string | Error): void;

  export function deepStrictEqual(actual: any, expected: any, message?: string | Error): void;

  export function notDeepStrictEqual(actual: any, expected: any, message?: string | Error): void;

  export function throws(block: Function, message?: string | Error): void;
  export function throws(block: Function, error: RegExp | Function, message?: string | Error): void;

  export function doesNotThrow(block: Function, message?: string | Error): void;
  export function doesNotThrow(block: Function, error: RegExp | Function, message?: string | Error): void;

  export function ifError(value: any): void;

// tslint:enable:ban-types
// end of node 'assert' module

  /**
   * Assert that a file exists or that each files in the array exists
   * @param path path to a file or an array of paths to files
   * @example
   * assert.file('templates/user.hbs');
   * assert.noFile(['templates/user.hbs', 'templates/user/edit.hbs']);
   */
  export function file(path: string | string[]): void;

  /**
   * Assert that a file doesn't exist
   * @param file path to a file
   * @example
   * assert.noFile('templates/user.hbs');
   * assert.noFile(['templates/user.hbs', 'templates/user/edit.hbs']);
   */
  export function noFile(file: string | string[]): void;

  /**
   * Assert that a file's content matches a regex or string
   * @param file path to a file
   * @param reg regex / string that will be used to search the file
   * @example
   * assert.fileContent('models/user.js', /App\.User = DS\.Model\.extend/);
   * assert.fileContent('models/user.js', 'App.User = DS.Model.extend');
   */
  export function fileContent(file: string | string[], reg: string | RegExp): void;

  /**
   * Assert that each file in an array of file-regex pairs matches its corresponding regex
   * @param pairs an array of arrays, where each subarray is a [String, RegExp] pair
   * @example
   * var arg = [
   *   [ 'models/user.js', /App\.User = DS\.Model\.extend/ ],
   *   [ 'controllers/user.js', /App\.UserController = Ember\.ObjectController\.extend/ ]
   * ]
   * assert.fileContent(arg);
   */
  export function fileContent(pairs: Array<[string, RegExp]>): void;

  /**
   * Assert that a file's content is the same as the given string
   * @param file path to a file
   * @param expectedContent the expected content of the file
   * @example
   * assert.equalsFileContent(
   *   'data.js',
   *   'const greeting = "Hello";\nexport default { greeting }'
   * );
   */
  export function equalsFileContent(file: string, expectedContent: string): void;

  /**
   * Assert that each file in an array of file-string pairs equals its corresponding string
   * @param pairs an array of arrays, where each subarray is a [String, String] pair
   * @example
   * assert.equalsFileContent([
   *   ['data.js', 'const greeting = "Hello";\nexport default { greeting }'],
   *   ['user.js', 'export default {\n  name: 'Coleman',\n  age: 0\n}']
   * ]);
   */
  export function equalsFileContent(pairs: Array<[string, string]>): void;

  /**
   * Assert that a file's content does not match a regex / string
   * @param file path to a file
   * @param reg regex / string that will be used to search the file
   * @example
   * assert.noFileContent('models/user.js', /App\.User = DS\.Model\.extend/);
   * assert.noFileContent('models/user.js', 'App.User = DS.Model.extend');
   */
  export function noFileContent(file: string | string[], reg: RegExp | string): void;

  /**
   * Assert that each file in an array of file-regex pairs does not match its corresponding regex
   * @param pairs an array of arrays, where each subarray is a [String, RegExp] pair
   * var arg = [
   *   [ 'models/user.js', /App\.User \ DS\.Model\.extend/ ],
   *   [ 'controllers/user.js', /App\.UserController = Ember\.ObjectController\.extend/ ]
   * ]
   * assert.noFileContent(arg);
   */
  export function noFileContent(pairs: Array<[string, RegExp]>): void;

  /**
   * Assert that two strings are equal after standardization of newlines
   * @param value a string
   * @param expected the expected value of the string
   * @example
   * assert.textEqual('I have a yellow cat', 'I have a yellow cat');
   */
  export function textEqual(value: string, expected: string): void;

  /**
   * Assert an Object implements an interface
   * @param subject subject implementing the façade
   * @param methods a façace, hash or array of keys to be implemented
   */
  export function implement(subject: object, methods: object | string[]): void;

  /**
   * Assert an Object doesn't implements any method of an interface
   * @param subject subject not implementing the methods
   * @param methods hash or array of method names to be implemented
   */
  export function notImplement(subject: object, methods: object | string[]): void;

  /**
   * Assert an object contains the provided keys
   * @param obj Object that should match the given pattern
   * @param content An object of key/values the object should contains
   */
  export function objectContent(obj: object, content: object): void;

  /**
   * Assert an object does not contain the provided keys
   * @param obj Object that should not match the given pattern
   * @param content An object of key/values the object should not contain
   */
  export function noObjectContent(obj: object, content: object): void;

  /**
   * Assert a JSON file contains the provided keys
   * @param filename
   * @param content An object of key/values the file should contains
   */
  export function JSONFileContent(filename: string, content: object): void;

  /**
   * @see JSONFileContent
   */
  export function jsonFileContent(filename: string, content: object): void;

  /**
   * Assert a JSON file does not contain the provided keys
   * @param filename
   * @param content An object of key/values the file should not contain
   */
  export function noJSONFileContent(filename: string, content: object): void;

  /**
   * @see noJSONFileContent
   */
  export function noJsonFileContent(filename: string, content: object): void;

}
