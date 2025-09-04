// src/store/userAtoms.js
import { atomFamily, selectorFamily } from "recoil";
import axios from "axios";

// -----------------
// USER SIGNUP STATE
// -----------------
export const userFirstNameAtom = atomFamily({
  key: "userFirstNameAtom",
  default: "",
});

export const userLastNameAtom = atomFamily({
  key: "userLastNameAtom",
  default: "",
});

export const userSignupEmailAtom = atomFamily({
  key: "userSignupEmailAtom",
  default: "",
});

export const userSignupPasswordAtom = atomFamily({
  key: "userSignupPasswordAtom",
  default: "",
});

// -----------------
// USER LOGIN STATE
// -----------------
export const userLoginEmailAtom = atomFamily({
  key: "userLoginEmailAtom",
  default: "",
});

export const userLoginPasswordAtom = atomFamily({
  key: "userLoginPasswordAtom",
  default: "",
});

// -----------------
// SELECTOR FOR USER SIGNUP
// -----------------
export const userSignupSelector = selectorFamily({
  key: "userSignupSelector",
  get:
    ({ firstName, lastName, email, password }) =>
    async () => {
      try {
        const res = await axios.post("/api/user/signup", {
          firstName,
          lastName,
          email,
          password,
        });
        return res.data; // Expected: { success: true, token, message }
      } catch (err) {
        console.error("User signup failed:", err);
        return { success: false, message: "Signup failed" };
      }
    },
});

// -----------------
// SELECTOR FOR USER LOGIN
// -----------------
export const userLoginSelector = selectorFamily({
  key: "userLoginSelector",
  get:
    ({ email, password }) =>
    async () => {
      try {
        const res = await axios.post("/api/user/login", {
          email,
          password,
        });
        return res.data; // Expected: { success: true, token, message }
      } catch (err) {
        console.error("User login failed:", err);
        return { success: false, message: "Login failed" };
      }
    },
});