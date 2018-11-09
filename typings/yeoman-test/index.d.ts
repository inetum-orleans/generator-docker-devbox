declare module 'yeoman-test' {
  import * as Generator from 'yeoman-generator'

  export type Dependency = string|[string, string]
  export type Env = any

  export interface RunContext {
    ran:boolean;
    inDirSet: boolean;
    args: string[];
    options: {};
    answers: Generator.Answers;
    localConfig: {};
    dependencies: Dependency[];

    new (generator: Generator, settings: {}): RunContext

    /**
     * Hold the execution until the returned callback is triggered
     * @return {Function} Callback to notify the normal execution can resume
     */
    async (): Function

    /**
     * Return a promise representing the generator run process
     * @return {Promise} Promise resolved on end or rejected on error
     */
    toPromise (): Promise<string>

    then (cb: (p: string) => void): Promise<string>

    catch (err: any): Promise<string>

    /**
     * Clean the provided directory, then change directory into it
     * @param  {String} dirPath - Directory path (relative to CWD). Prefer passing an absolute
     *                            file path for predictable results
     * @param {Function} [cb] - callback who'll receive the folder path as argument
     * @return {this} run context instance
     */

    inDir (dirPath: string, cb?: Function): this

    /**
     * Change directory without deleting directory content.
     * @param  {String} dirPath - Directory path (relative to CWD). Prefer passing an absolute
     *                            file path for predictable results
     * @return {this} run context instance
     */
    cd (dirPath: string): this

    /**
     * Cleanup a temporary directy and change the CWD into it
     *
     * This method is called automatically when creating a RunContext. Only use it if you need
     * to use the callback.
     *
     * @param {Function} [cb] - callback who'll receive the folder path as argument
     * @return {this} run context instance
     */
    inTmpDir (cb?: (dir: string) => any): this

    /**
     * Clean the directory used for tests inside inDir/inTmpDir
     */
    cleanTestDirectory (): void

    /**
     * Provide arguments to the run context
     * @param  {String|Array} args - command line arguments as Array or space separated string
     * @return {this}
     */

    withArguments (args: string | string[]): this

    /**
     * Provide options to the run context
     * @param  {Object} options - command line options (e.g. `--opt-one=foo`)
     * @return {this}
     */

    withOptions (options: {}): this

    withPrompts (answers: Generator.Answers): this

    /**
     * Provide dependent generators
     * @param {Array} dependencies - paths to the generators dependencies
     * @return {this}
     * @example
     * var angular = new RunContext('../../app');
     * angular.withGenerators([
     *   '../../common',
     *   '../../controller',
     *   '../../main',
     *   [helpers.createDummyGenerator(), 'testacular:app']
     * ]);
     * angular.on('end', function () {
     *   // assert something
     * });
     */

    withGenerators (dependencies: [Dependency]): this

    /**
     * Mock the local configuration with the provided config
     * @param  {Object} localConfig - should look just like if called config.getAll()
     * @return {this}
     */
    withLocalConfig (localConfig: {}): this
  }

/**
 * Create a function that will clean up the test directory,
 * cd into it, and create a dummy gruntfile inside. Intended for use
 * as a callback for the mocha `before` hook.
 *
 * @param {String} dir - path to the test directory
 * @returns {Function} mocha callback
 */

export function setUpTestDirectory(dir: string): Function

/**
 *
 * Generates a new Gruntfile.js in the current working directory based on
 * options hash passed in.
 *
 * @param {Object} options - Grunt configuration
 * @param {Function} done  - callback to call on completion
 * @example
 * before(helpers.gruntfile({
 *   foo: {
 *     bar: '<config.baz>'
 *   }
 * }));
 *
 */

export function gruntfile (options: object, done?: Function): void

/**
 * Clean-up the test directory and cd into it.
 * Call given callback after entering the test directory.
 * @param {String} dir - path to the test directory
 * @param {Function} cb - callback executed after setting working directory to dir
 * @example
 * testDirectory(path.join(__dirname, './temp'), function () {
 *   fs.writeFileSync('testfile', 'Roses are red.');
 * });
 */

export function testDirectory(dir: String, cb?: Function): void

/**
 * Answer prompt questions for the passed-in generator
 * @param {Generator} generator - a Yeoman generator
 * @param {Object} answers - an object where keys are the
 *   generators prompt names and values are the answers to
 *   the prompt questions
 * @example
 * mockPrompt(angular, {'bootstrap': 'Y', 'compassBoostrap': 'Y'});
 */

export function mockPrompt(generator: Generator, answers: Generator.Answers): void

/**
 * Restore defaults prompts on a generator.
 * @param {Generator} generator
 */
export function restorePrompt(generator: Generator): void

/**
 * Provide mocked values to the config
 * @param  {Generator} generator - a Yeoman generator
 * @param  {Object} localConfig - localConfig - should look just like if called config.getAll()
 */
export function mockLocalConfig(generator: Generator, localConfig: {}): void

/**
 * Create a simple, dummy generator
 */

export function createDummyGenerator(): Generator

/**
 * Create a generator, using the given dependencies and controller arguments
 * Dependecies can be path (autodiscovery) or an array [<generator>, <name>]
 *
 * @param {String} name - the name of the generator
 * @param {Array} dependencies - paths to the generators dependencies
 * @param {Array|String} args - arguments to the generator;
 *   if String, will be split on spaces to create an Array
 * @param {Object} options - configuration for the generator
 * @example
 *  var deps = ['../../app',
 *              '../../common',
 *              '../../controller',
 *              '../../main',
 *              [createDummyGenerator(), 'testacular:app']
 *            ];
 * var angular = createGenerator('angular:app', deps);
 */

export function createGenerator(name: string, dependencies: (Dependency)[], args: string|string[], options: {}): Generator

/**
 * Register a list of dependent generators into the provided env.
 * Dependecies can be path (autodiscovery) or an array [<generator>, <name>]
 *
 * @param {Array} dependencies - paths to the generators dependencies
 */

export function registerDependencies(env: Env, dependencies: (Dependency)[]): void

/**
 * Run the provided Generator
 * @param  {String|Function} GeneratorOrNamespace - Generator constructor or namespace
 * @return {RunContext}
 */

export function run(GeneratorOrNamespace: string | typeof Generator, settings?: {}): RunContext

}
