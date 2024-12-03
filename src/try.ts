import { ObjectError } from "./error/object.error";

export type AcceptFunction = (error: Error) => boolean;

export class Try<Response> extends Promise<Response> {
  /**
   * The various catch
   *
   * @private
   */
  private catchBlocks: Array<{types?: any; checker?: AcceptFunction, method: CallableFunction }> = [];

  private resolve: CallableFunction;
  private reject: CallableFunction;

  /**
   * You should use the static try method to construct.
   *
   * @param method
   * @private
   */
  private constructor(method) {
    let _reject: CallableFunction;

    super((resolve, reject) => {
      _reject = reject;
      
      const value = method();
      resolve(value);

      // super.catch(async (e) => {
      //   // if it is not an error object, we will convert it
      //   if (!(e instanceof Error)) {
      //     e = new ObjectError("Non Error thrown as an error.", e);
      //   }

      //   // we need to sort the catch block, so the "null" (is catch all) type goes last
      //   this.catchBlocks.sort((a, b) => {
      //     if (a.checker || b.checker) {
      //       return a.checker ? -1 : 1;
      //     }

      //     if (a.types.includes(null) && !b.types.includes(null)) {
      //       return 1;
      //     } else if (b.types.includes(null)) {
      //       return -1;
      //     }

      //     return 0;
      //   });

      //   // find the first matching catch block
      //   for (const catchBlock of this.catchBlocks) {
      //     if (catchBlock.types) {
      //       for (const acceptedType of catchBlock.types) {
      //         if (acceptedType === null || e instanceof acceptedType) {
      //           this.resolve(await catchBlock.method(e));
      //         }
      //       }
      //     }

      //     if (catchBlock.checker !== undefined) {
      //       if (catchBlock.checker(e)) {
      //         this.resolve(await catchBlock.method(e));
      //       }
      //     }
      //   }

      //   // no matching block, so throw the error
      //   this.reject(e);
      // });
    });

    this.reject = _reject;
  }

  /**
   * Start the try/catch with this method, passing in the content of the normal try {} block.
   *
   * @param method
   */
  static to<Response>(method: () => Response | Promise<Response>) {
    return new Try<Response>(method);
  }

  catchIf<E extends Error, ErrorResponse = void, T extends Try<Response> = this>(this: T, checker: AcceptFunction, method: (error: E) => ErrorResponse | Promise<ErrorResponse>): T {
    this.catchBlocks.push({
      checker,
      method,
    });

    return this;
  }

  /**
   * Register a catch (all) block.
   *
   * @param method the catch block
   */
  _catch<ErrorResponse, T extends Try<Response> = this>(this: T, method: (error: Error) => ErrorResponse | Promise<ErrorResponse>): T;

  /**
   * Register a catch block for (a) specific error(s).
   *
   * @param type the type of the error that this catch block accepts
   * @param method the catch block
   */
  _catch<E extends Error, ErrorResponse = void, T extends Try<Response> = this>(
    this: T,
    type: { new (...args): E } | { new (...args): E }[],
    method: (error: E) => ErrorResponse | Promise<ErrorResponse>
  ): T;

  /**
   * Register a catch block with an AcceptFunction
   *
   * @param type the type of the error that this catch block accepts
   * @param method the catch block
   */
  _catch<E extends Error, ErrorResponse = void, T extends Try<Response> = this>(
    this: T,
    type: AcceptFunction,
    method: (error: E) => ErrorResponse | Promise<ErrorResponse>
  ): T;

  /**
   * Implementation of all the above.
   *
   * @param param1
   * @param param2
   */
  _catch(param1 = null, param2 = null) {
    const method = param2 === null ? param1 : param2;
    let types = param2 !== null ? param1 : null;

    // convert types to array
    types = Array.isArray(types) ? types : [types];

    this.catchBlocks.push({
      types,
      method,
    });

    return this;
  }
}
