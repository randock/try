import { Try } from "@src/try";

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

    expect(errorThrown).toBeTruthy();
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

    expect(errorThrown).toBeTruthy();
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

    expect(errorThrown).toBeTruthy();
  });

  it("Should allow multiple catch blocks and maintain order", async () => {
    let errorThrown = false;
    await Try.to<void>(() => {
      throw new ChildOfFirstCustomError();
    })
      .catch(FirstCustomError, (error) => {
        errorThrown = true;
      })
      .catch(ChildOfFirstCustomError, (error) => {})
      .run<void>();

    expect(errorThrown).toBeTruthy();
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

    expect(allGood).toBeTruthy();
  });

  it("Should return success response", async () => {
    const allGood = Try.to<boolean>(() => {
      return true;
    });

    expect(allGood).toBeTruthy();
  });

  it("Should return response from catch block", async () => {
    const allGood = Try.to<boolean>(() => {
      throw new FirstCustomError();
    }).catch(FirstCustomError, () => {
      return true;
    });

    expect(allGood).toBeTruthy();
  });
});
