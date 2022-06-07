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
      .catch(FirstCustomError, (error) => {
        errorThrown = true;
      })
      .run<void>();

    expect(errorThrown).toBe(true);
  });

  it("Should allow error inheritance", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new ChildOfFirstCustomError();
    })
      .catch(FirstCustomError, (error) => {
        errorThrown = true;
      })
      .run<void>();

    expect(errorThrown).toBe(true);
  });

  it("Should allow multiple typed catch", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new FirstCustomError();
    })
      .catch([FirstCustomError, SecondCustomError], (error) => {
        errorThrown = true;
      })
      .run<void>();

    expect(errorThrown).toBe(true);
  });

  it("Should allow multiple catch blocks and maintain order for typed errors", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new ChildOfFirstCustomError();
    })
      .catch(FirstCustomError, (error) => {
        errorThrown = true;
      })
      .catch(ChildOfFirstCustomError, (error) => {})
      .run<void>();

    expect(errorThrown).toBe(true);
  });

  it("Should allow multiple catch blocks and order the catch all error last", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new FirstCustomError();
    })
      .catch(() => {
        // catch all "other" block
      })
      .catch(FirstCustomError, (error) => {
        errorThrown = true;
      })
      .run<void>();

    expect(errorThrown).toBe(true);
  });

  it("Should call finally", async () => {
    let allGood = false;
    await Try.to<void>(() => {
      throw new ChildOfFirstCustomError();
    })
      .catch(ChildOfFirstCustomError, (error) => {})
      .finally(() => {
        allGood = true;
      });

    expect(allGood).toBe(true);
  });

  it("Should return success response", async () => {
    const allGood = await Try.to<boolean>(() => {
      return true;
    }).run();

    expect(allGood).toBe(true);
  });

  it("Should return response from catch block", async () => {
    const allGood = await Try.to<boolean>(() => {
      throw new FirstCustomError();
    })
      .catch(FirstCustomError, () => {
        return true;
      })
      .run();

    expect(allGood).toBe(true);
  });

  it("Should convert any non Error thrown to an ObjectError", async () => {
    let errorThrown = false;
    await Try.to<boolean>(() => {
      throw {
        who: "does this",
      };
    })
      .catch(ObjectError, () => {
        errorThrown = true;
      })
      .run();

    expect(errorThrown).toBe(true);
  });
});
