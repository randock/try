import { Try } from "@src/try";
import { ObjectError } from "@src/error/object.error";

class FirstCustomError extends Error {}
class ChildOfFirstCustomError extends FirstCustomError {}

class SecondCustomError extends Error {}

describe("Try", () => {
  it("Should allow typed catch", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new FirstCustomError();
    })
      ._catch(FirstCustomError, (error) => {
        errorThrown = true;
      });

    expect(errorThrown).toBe(true);
  });

  it("Should allow error inheritance", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new ChildOfFirstCustomError();
    })
      ._catch(FirstCustomError, (error) => {
        errorThrown = true;
      });

    expect(errorThrown).toBe(true);
  });

  it("Should allow multiple typed catch", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new FirstCustomError();
    })
      ._catch([FirstCustomError, SecondCustomError], (error) => {
        errorThrown = true;
      });

    expect(errorThrown).toBe(true);
  });

  it("Should allow function to determine whether to accept or not", async () => {
    let errorThrown = false;

    await Try.to<void>(() => {
      throw new FirstCustomError();
    })
      .catchIf((e) => true, (error) => {
        errorThrown = true;
      });

    expect(errorThrown).toBe(true);
  });

  it("Should allow function to determine whether to accept or not (2)", async () => {
    await expect(async () => {
      await Try.to<void>(() => {
        throw new FirstCustomError();
      })
      .catchIf((e) => false, (error) => {
      })
    }).rejects.toThrowError(FirstCustomError);
  });

  it("Should allow multiple catch blocks and maintain order for typed errors", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new ChildOfFirstCustomError();
    })
      ._catch(FirstCustomError, (error) => {
        errorThrown = true;
      })
      ._catch(ChildOfFirstCustomError, (error) => {});

    expect(errorThrown).toBe(true);
  });

  it("Should allow multiple catch blocks and order the catch all error last", async () => {
    let errorThrown = false;
    await Try.to(() => {
      throw new FirstCustomError();
    })
      ._catch(() => {
        // catch all "other" block
      })
      ._catch(FirstCustomError, (error) => {
        errorThrown = true;
      });

    expect(errorThrown).toBe(true);
  });

  it("Should call finally", async () => {
    let allGood = false;
    await Try.to(() => {
      throw new ChildOfFirstCustomError();
    })
      ._catch(ChildOfFirstCustomError, (error) => {})
      .finally(() => {
        allGood = true;
      });

    expect(allGood).toBe(true);
  });

  it("Should return success response", async () => {
    const allGood = await Try.to<boolean>(() => {
      return true;
    });

    expect(allGood).toBe(true);
  });

  it("Should return response from catch block", async () => {
    const allGood = await Try.to<boolean>(() => {
      throw new FirstCustomError();
    })
      ._catch(FirstCustomError, () => {
        return true;
      });

    expect(allGood).toBe(true);
  });

  it("Should convert any non Error thrown to an ObjectError", async () => {
    let errorThrown = false;
    await Try.to<boolean>(() => {
      throw {
        who: "does this",
      };
    })
      ._catch(ObjectError, () => {
        errorThrown = true;
      });

    expect(errorThrown).toBe(true);
  });
});
