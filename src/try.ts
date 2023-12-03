import { ObjectError } from "./error/object.error";

export class Try<Response> {
  /**
   * The various catch
   *
   * @private
   */
  private catchBlocks: Array<Record<"types" | "method", any>> = [];

  /**
   * The function that contains the try {} body.
   *
   * @private
   */
  private tryFunction: () => Response = null;

  /**
   * The function that will be called finally {}.
   *
   * @private
   */
  private finallyFunction: CallableFunction = null;

  /**
   * You should use the static try method to construct.
   *
   * @param method
   * @private
   */
  private constructor(method) {
    this.tryFunction = method;
  }

  /**
   * Start the try/catch with this method, passing in the content of the normal try {} block.
   *
   * @param method
   */
  static to<Response>(method: () => Response | Promise<Response>) {
    return new Try<Response>(method);
  }

  /**
   * Register a catch (all) block.
   *
   * @param method the catch block
   */
  catch<ErrorResponse, T extends Try<Response>>(this: T, method: (error: Error) => ErrorResponse | Promise<ErrorResponse>): T;

  /**
   * Register a catch block for (a) specific error(s).
   *
   * @param type the type of the error that this catch block accepts
   * @param method the catch block
   */
  catch<E extends Error, ErrorResponse, T extends Try<Response>>(
    this: T,
    type: { new (...args): E } | { new (...args): E }[],
    method: (error: E) => ErrorResponse | Promise<ErrorResponse>
  ): T;

  /**
   * Implementation of all the above.
   *
   * @param param1
   * @param param2
   */
  catch(param1 = null, param2 = null) {
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

  /**
   * Register a finally method
   *
   * @param method
   */
  async finally<T extends Try<Response>, FinallyResponse>(this: T, method: () => FinallyResponse | Promise<FinallyResponse>): Promise<Response> {
    this.finallyFunction = method;

    return this.run();
  }

  /**
   * You only need to call run, if you don't register a finally method
   */
  async run<T extends Try<Response>>(this: T): Promise<Response> {
    try {
      return await this.tryFunction();
    } catch (e: any) {
      // if it is not an error object, we will convert it
      if (!(e instanceof Error)) {
        e = new ObjectError("Non Error thrown as an error.", e);
      }

      // we need to sort the catch block, so the "null" (is catch all) type goes last
      this.catchBlocks.sort((a, b) => {
        if (a.types.includes(null) && !b.types.includes(null)) {
          return 1;
        } else if (b.types.includes(null)) {
          return -1;
        }

        return 0;
      });

      // find the first matching catch block
      for (const catchBlock of this.catchBlocks) {
        for (const acceptedType of catchBlock.types) {
          if (acceptedType === null || e instanceof acceptedType) {
            return await catchBlock.method(e);
          }
        }
      }

      // no matching block, so throw the error
      throw e;
    } finally {
      if (this.finallyFunction !== null) {
        await this.finallyFunction();
      }
    }
  }
}
