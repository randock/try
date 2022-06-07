import { ObjectError } from "./error/object.error";

export class Try {
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
  private tryFunction: CallableFunction = null;

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
  private constructor(method: CallableFunction) {
    this.tryFunction = method;
  }

  /**
   * Start the try/catch with this method, passing in the content of the normal try {} block.
   *
   * @param method
   */
  static to<T>(method: () => T | Promise<T>): Try {
    return new Try(method);
  }

  /**
   * Register a catch (all) block.
   *
   * @param method the catch block
   */
  catch<R>(method: (error: Error) => R | Promise<R>): Try;

  /**
   * Register a catch block for (a) specific error(s).
   *
   * @param type the type of the error that this catch block accepts
   * @param method the catch block
   */
  catch<T extends Error, R>(
    type: { new (...args): T } | { new (...args): T }[],
    method: (error: T) => R | Promise<R>
  ): Try;

  /**
   * Implementation of all the above.
   *
   * @param param1
   * @param param2
   */
  catch(param1 = null, param2 = null): Try {
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
  async finally<T>(method: () => T | Promise<T>): Promise<T> {
    this.finallyFunction = method;

    return this.run<T>();
  }

  /**
   * You only need to call run, if you don't register a finally method
   */
  async run<T>(): Promise<T> {
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
