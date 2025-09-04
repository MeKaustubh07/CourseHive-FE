// recoil/adminState.js
import { atomFamily, selectorFamily } from "recoil";
import axios from "axios";

// -----------------
// USER SIGNUP STATE
// -----------------
export const firstNameAtom = atomFamily({
  key: "firstNameAtom",
  default: ""
});

export const lastNameAtom = atomFamily({
  key: "lastNameAtom",
  default: ""
});

export const signupEmailAtom = atomFamily({
  key: "signupEmailAtom",
  default: ""
});

export const signupPasswordAtom = atomFamily({
  key: "signupPasswordAtom",
  default: ""
});

// -----------------
// USER LOGIN STATE
// -----------------
export const loginEmailAtom = atomFamily({
  key: "loginEmailAtom",
  default: ""
});

export const loginPasswordAtom = atomFamily({
  key: "loginPasswordAtom",
  default: ""
});

// -----------------
// AUTH TOKEN (shared across all admin queries)
// -----------------
export const adminTokenAtom = atomFamily({
  key: "adminTokenAtom",
  default: ""
});

export const adminCoursesAtom = atomFamily({
  key: "adminCoursesAtom",
  default: [],   // each adminId gets its own empty array initially
});

// -----------------
// SELECTOR FOR SIGNUP
// -----------------
export const signupSelector = selectorFamily({
  key: "signupSelector",
  get: ({ firstName, lastName, email, password }) => async () => {
    try {
      const res = await axios.post("/api/admin/signup", {
        firstName,
        lastName,
        email,
        password
      });
      return res.data; // { success, token, message }
    } catch (err) {
      console.error("Signup failed:", err);
      return { success: false, message: "Signup failed" };
    }
  }
});

// -----------------
// SELECTOR FOR LOGIN
// -----------------
export const loginSelector = selectorFamily({
  key: "loginSelector",
  get: ({ email, password }) => async () => {
    try {
      const res = await axios.post("/api/admin/login", {
        email,
        password
      });
      return res.data; // { success, token, message }
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, message: "Login failed" };
    }
  }
});

// -----------------
// ADMIN COURSE CRUD
// -----------------

// 1. CREATE COURSE
export const createCourseSelector = selectorFamily({
  key: "createCourseSelector",
  get: ({ token, title, description, VideoUrl, price }) => async () => {
    try {
      const res = await axios.post(
        "/api/admin/addcourse",
        { title, description, VideoUrl, price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data; // { success, course, message }
    } catch (err) {
      console.error("Create course failed:", err);
      return { success: false, message: "Create course failed" };
    }
  }
});

// 2. GET ALL COURSES (owned by this admin)
export const getCoursesSelector = selectorFamily({
  key: "getCoursesSelector",
  get: ({ token }) => async () => {
    try {
      const res = await axios.get("/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data; // { success, courses: [] }
    } catch (err) {
      console.error("Fetch courses failed:", err);
      return { success: false, courses: [] };
    }
  }
});

// 3. EDIT COURSE
export const editCourseSelector = selectorFamily({
  key: "editCourseSelector",
  get: ({ token, courseId, title, description, VideoUrl, price }) => async () => {
    try {
      const res = await axios.put(
        "/api/admin/editcourse",
        { courseId, title, description, VideoUrl, price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data; // { success, message }
    } catch (err) {
      console.error("Edit course failed:", err);
      return { success: false, message: "Edit course failed" };
    }
  }
});

// 4. DELETE COURSE
export const deleteCourseSelector = selectorFamily({
  key: "deleteCourseSelector",
  get: ({ token, courseId }) => async () => {
    try {
      const res = await axios.delete("/api/admin/deletecourse", {
        headers: { Authorization: `Bearer ${token}` },
        data: { courseId }
      });
      return res.data; // { success, message }
    } catch (err) {
      console.error("Delete course failed:", err);
      return { success: false, message: "Delete course failed" };
    }
  }
});