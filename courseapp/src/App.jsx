import "./index.css";
import './styles/shared.css';

import { RecoilRoot } from "recoil";
import { BrowserRouter , Router, Routes, Route , Link} from "react-router-dom";
import { memo } from "react";

import  Landing from "./routes/Landing/landing.jsx";
import Materials from "./routes/AdminDash/Materials.jsx";
import PDFViewer from "./routes/Landing/PdfView.jsx" ;
import  Signup  from "./routes/AdminDash/Signup.jsx";
import TopBar from "./routes/Landing/Topbar.jsx" ;
import  Login from "./routes/AdminDash/Login.jsx";
import UserSignup from "./routes/userDash/Usignup.jsx";
import UserLogin from "./routes/userDash/Ulogin.jsx";
import Explore from "./routes/userDash/Explore.jsx";
import MyPurchase from "./routes/userDash/MyPurchase.jsx" ;
import AdminCourses from "./routes/AdminDash/Editcourse.jsx";
import CourseForm from "./routes/AdminDash/Courses.jsx";
import UserAttempt from "./routes/userDash/UserTests.jsx";
import AboutUs from "./routes/Landing/AboutUs.jsx";
import AboutProject from "./routes/Landing/AboutProject.jsx";
import UserMaterials from "./routes/userDash/UserMaterials.jsx";
import UserPapers from "./routes/userDash/UserPapers.jsx";

import WatchCourse from "./routes/userDash/Player.jsx";
import AdminTests from "./routes/AdminDash/AdminTests.jsx";

const MainContent = memo(function MainContent() {
  return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/addcourse" element={<CourseForm />} />
        <Route path="/admin/managetests" element={<AdminTests />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/signup" element={<Signup />} />
        <Route path="/admin/mycourses" element={<AdminCourses />} />
        <Route path="/admin/materials" element={<Materials/>} />

        {/* Add these two routes for user signup/login */}
        <Route path="/admin/pdfview/:id" element={<PDFViewer />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/explore" element={<Explore />} />
        <Route path="/user/mypurchase" element={<MyPurchase />} />
        <Route path="/user/watch/:courseid" element={<WatchCourse />} />
        <Route path="/user/papers" element={<UserPapers />} />
        <Route path="/user/materials" element={<UserMaterials />} />
        <Route path="/user/givetests" element={<UserAttempt />} />
        



        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/aboutproject" element={<AboutProject />} />

      </Routes>
  );
});

function App() {
  return (
    <RecoilRoot>
    <BrowserRouter>
      <TopBar />
      <div style={{ paddingTop: "70px" }}>
        <MainContent />
      </div>
    </BrowserRouter>   
  </RecoilRoot>
  );
}

export default App;