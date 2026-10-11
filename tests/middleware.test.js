const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { isOwnerRole, isAdminRole } = require("../middleware.js");

function createMockReq(user, originalUrl = "/test") {
  return {
    isAuthenticated: () => !!user,
    user: user || null,
    session: {},
    originalUrl,
    flash: (type, msg) => {
      this.lastFlash = { type, msg };
    },
  };
}

function createMockRes() {
  const res = {
    redirectedTo: null,
    redirect: (url) => {
      res.redirectedTo = url;
    },
  };
  return res;
}

describe("Middleware Role Authorization", () => {
  describe("isOwnerRole", () => {
    it("should allow owners through", () => {
      const req = createMockReq({ role: "owner" });
      const res = createMockRes();
      let calledNext = false;
      isOwnerRole(req, res, () => {
        calledNext = true;
      });
      assert.equal(calledNext, true);
      assert.equal(res.redirectedTo, null);
    });

    it("should allow admins through", () => {
      const req = createMockReq({ role: "admin" });
      const res = createMockRes();
      let calledNext = false;
      isOwnerRole(req, res, () => {
        calledNext = true;
      });
      assert.equal(calledNext, true);
    });

    it("should redirect unauthenticated users to /login", () => {
      const req = createMockReq(null);
      const res = createMockRes();
      let calledNext = false;
      isOwnerRole(req, res, () => {
        calledNext = true;
      });
      assert.equal(calledNext, false);
      assert.equal(res.redirectedTo, "/login");
    });

    it("should block students and redirect to /listings", () => {
      const req = createMockReq({ role: "student" });
      const res = createMockRes();
      let calledNext = false;
      isOwnerRole(req, res, () => {
        calledNext = true;
      });
      assert.equal(calledNext, false);
      assert.equal(res.redirectedTo, "/listings");
    });
  });

  describe("isAdminRole", () => {
    it("should allow admins through", () => {
      const req = createMockReq({ role: "admin" });
      const res = createMockRes();
      let calledNext = false;
      isAdminRole(req, res, () => {
        calledNext = true;
      });
      assert.equal(calledNext, true);
    });

    it("should block non-admins", () => {
      const req = createMockReq({ role: "owner" });
      const res = createMockRes();
      let calledNext = false;
      isAdminRole(req, res, () => {
        calledNext = true;
      });
      assert.equal(calledNext, false);
      assert.equal(res.redirectedTo, "/listings");
    });
  });
});
