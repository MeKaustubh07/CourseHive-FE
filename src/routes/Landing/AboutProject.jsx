import React from "react";
import PreviewImg from "../../Preview.png";


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
    "OAuth",
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
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 lg:p-10">
        
        {/* RIGHT SIDE - Preview & Notes (Mobile First) */}
        <div className="order-1 lg:order-2 lg:col-span-1 space-y-4 sm:space-y-6">
          {/* App Preview */}
          <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3">Project Preview</h2>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img 
                src={PreviewImg} 
                alt="CourseHive Project Preview" 
                className="w-full h-auto object-cover" 
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow">
            <h2 className="text-lg sm:text-xl font-bold mb-3">Development Notes</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              This project emphasizes scalability, role-based authentication, and
              real-time collaboration features. Built with a modern MERN +
              TypeScript stack, ensuring security and performance.
            </p>
          </div>
        </div>

        {/* LEFT SIDE - Project Details (Mobile Second) */}
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Project Overview */}
          <section className="bg-white p-4 sm:p-6 rounded-2xl shadow">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">{projectData.title}</h2>
            <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
              {projectData.overview}
            </p>
          </section>

          {/* Features */}
          <section className="bg-white p-4 sm:p-6 rounded-2xl shadow">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* User End */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-base sm:text-lg text-blue-700 mb-3 flex items-center">
                  👤 User End
                </h3>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  {projectData.features.user.map((f, i) => (
                    <li key={i} className="text-gray-700">{f}</li>
                  ))}
                </ul>
              </div>

              {/* Admin End */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-base sm:text-lg text-green-700 mb-3 flex items-center">
                  ⚙️ Admin End
                </h3>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  {projectData.features.admin.map((f, i) => (
                    <li key={i} className="text-gray-700">{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="bg-white p-4 sm:p-6 rounded-2xl shadow">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Tech Stack</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {projectData.tech.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200 border border-purple-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutProject;