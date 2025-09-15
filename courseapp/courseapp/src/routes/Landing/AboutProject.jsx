import React from "react";
import PreviewImg from "../../Preview.png" ;

// ------------------ Recoil State (Optional) ------------------
// You can make this dynamic with Recoil if you want, but for now static example:
const projectData = {
  title: "CourseHive : Course Selling & Creation Platform",
  overview: `A full-featured course selling and creation platform that allows 
  users to purchase, view, and interact with online courses, while providing 
  administrators with powerful tools to manage course content, users, and data.`,
  features: {
    user: [
      "Browse and purchase courses securely",
      "Stream video lectures online with smooth playback",
      "Download materials and past exam papers",
      "Attempt online test series with instant results",
      "Track purchased courses and progress",
    ],
    admin: [
      "Create and manage courses with structured modules",
      "Upload lecture videos, notes, and papers to Cloudinary",
      "Manage users, purchases, and payments",
      "Monitor platform analytics and course engagement",
      "Secure authentication and role-based access control",
    ],
  },
  tech: [
    "React",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "Node.js",
    "Express.js",
    "MongoDB",
    "JWT",
    "better-auth",
    "bcrypt",
    "Zod",
    "WebSockets",
    "Cloudinary",
    "HTML5",
    "CSS3",
  ],
};

const AboutProject = () => {
  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Background Grid + Gradient */}
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
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-3 gap-6 p-10">
        {/* LEFT SIDE */}
        <div className="col-span-2 space-y-6">
          {/* Project Overview */}
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-3">{projectData.title}</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {projectData.overview}
            </p>
          </section>

          {/* Features */}
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Key Features</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* User End */}
              <div>
                <h3 className="font-semibold text-lg text-blue-600">User End</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {projectData.features.user.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Admin End */}
              <div>
                <h3 className="font-semibold text-lg text-green-600">Admin End</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {projectData.features.admin.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {projectData.tech.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm shadow-sm hover:bg-gray-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDE (Optional for Image/Diagram) */}
        <div className="col-span-1 space-y-6">
          {/* App Snapshot Placeholder */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center h-64">
            <p className="text-gray-500 text-center">
            <img 
            src={PreviewImg} 
            alt="Project Preview" 
            className="rounded-xl shadow-md object-cover w-full h-full" 
            />
            </p>
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-3">Notes</h2>
            <p className="text-gray-700 text-sm">
              This project emphasizes scalability, role-based authentication, and
              real-time collaboration features. Built with a modern MERN +
              TypeScript stack, ensuring security and performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutProject;