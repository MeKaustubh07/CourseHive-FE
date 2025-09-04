import React from "react";
import { atom, useRecoilValue } from "recoil";
import coverImage from "../../cover.jpeg"; // ✅ your image

// ------------------ Recoil State ------------------
export const aboutUsState = atom({
  key: "aboutUsState",
  default: {
    profile: {
      name: "Kaustubh M. Patange",
      email: "kaustubh.mp007@gmail.com",
      address:
        "Yogidaj nagar, plot no. 6, near baldawa hospital, murarjipeth, Solapur",
      Github: "MeKaustubh07",
      photo: coverImage,
    },
    academic: [
      {
        year: "2021",
        degree: "Primary & Secondary",
        institute: "B.F. Damani High School, Solapur",
      },
      {
        year: "2023",
        degree: "Higher Secondary",
        institute: "Chandak College of Arts and Science, Solapur",
      },
      {
        year: "`2027",
        degree: "B.Tech",
        institute: "Walchand Institute Of Technology, Solapur",
      },
    ],
    academicScore: [
      { year: "10th Board", score: "90.60%" },
      { year: "12th Board", score: "72.00%" },
      { year: "Engg Agre.", score: "80.00%" },
      { year: "GPA", score: "9.00" },
    ],
    projects: [
      {
        title: "CourseHive",
        github: "https://github.com/MeKaustubh07/DiceRollGame",
        // demo: "https://youtu.be/demoLink", // optional
        tech: " MongoDB , ExpressJs , ReactJs , Node , Tailwind , Cloudinary ",
        description:
          " A Full-Stack CourseSelling / Creating App For Watching Online Courses , Online Assesment , Materials and Reaching New Career Heights ",
      },
      {
        title: "Spotify Clone",
        github: "https://github.com/MeKaustubh07/SpotifyClone",
        tech: "HTML, CSS, JavaScript, Tailwind",
        description:
          "Built a Spotify Clone replicating the core functionalities of a streaming platform with responsive UI, animations, and dynamic audio playback.",
      },
      {
        title: "Gym Landing Page",
        github: "https://github.com/MeKaustubh07/GymLandingPage",
        tech: "HTML, CSS, JavaScript, Tailwind",
        description:
          "Designed and developed a responsive gym landing page featuring animations, branding focus, accessibility, and smooth performance.",
      },
    ],
    experience: [
      {
        title: "SIH",
        description: "Cleared all college rounds for our problem statement.",
      },
      {
        title: "Competitive Programming",
        description:
          "Solved 300+ DSA problems in C++ across multiple coding platforms.",
      },
      {
        title: "LeetCode",
        description: "Ranked in the top 20% globally on LeetCode.",
      },
      {
        title: "HackerRank",
        description:
          "Earned Gold Badge for exceptional proficiency in problem-solving.",
      },
    ],
    bio: `Hi, I'm Kaustubh M. Patange, a tech enthusiast with a strong interest 
           in building dynamic web applications and solving real-world problems. 
           I enjoy exploring different frameworks and tools, from frontend design 
           with React to backend systems with Node.js. Through projects and 
           competitive programming, I’ve honed my problem-solving, development, 
           and collaboration skills.`,
  },
});

// ------------------ Component ------------------
const AboutUs = () => {
  const data = useRecoilValue(aboutUsState);

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Background Grid + Gradient (STATIC) */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-3 gap-6 p-10">
        {/* LEFT SIDE */}
        <div className="col-span-2 space-y-6">
          {/* Academic */}
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-3">Academic Record</h2>
            <ul className="list-disc pl-5 space-y-1">
              {data.academic.map((item, i) => (
                <li key={i}>
                  {item.degree} ({item.year}) – {item.institute}
                </li>
              ))}
            </ul>
          </section>

          {/* Scores */}
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-3">Academic Scores</h2>
            <div className="grid grid-cols-5 gap-4 text-center">
              {data.academicScore.map((s, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <p className="text-sm">{s.year}</p>
                  <p className="font-bold text-lg">{s.score}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Projects</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold text-lg">{i + 1}. {proj.title}</h3>
                <p className="text-sm mt-1">{proj.description}</p>
                <p className="text-gray-700 text-sm mt-1">
                  <span className="font-medium">Tech:</span> {proj.tech}
                </p>
                <div className="mt-1 space-x-3">
                  <a
                    href={proj.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    🔗 GitHub
                  </a>
                  {proj.demo && (
                    <a
                      href={proj.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:underline text-sm"
                    >
                      ▶ Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Experience (Replaces Co-Curricular) */}
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-3">Extra Curricular </h2>
            <ul className="list-disc pl-5 space-y-2">
              {data.experience.map((exp, i) => (
                <li key={i}>
                  <span className="font-medium">{exp.title}:</span>{" "}
                  {exp.description}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <img
              src={data.profile.photo}
              alt={data.profile.name}
              className="w-full h-56 object-cover opacity-90"
            />
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold">{data.profile.name}</h2>
              <p className="text-gray-600">{data.profile.email}</p>
              <p className="text-gray-500 text-sm">{data.profile.address}</p>
              <a
                href={`https://github.com/${data.profile.Github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-500 hover:underline"
              >
                @{data.profile.Github}
              </a>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-3">About Me</h2>
            <p className="text-gray-700 text-sm whitespace-pre-line">
              {data.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;