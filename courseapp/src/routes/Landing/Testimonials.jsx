import { motion } from "framer-motion";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "The LIVE classes were so engaging that it was super easy to always stay focused. The teachers were always there to resolve my doubts in no time! I felt empowered & confident!",
      name: "Aritro Ray",
      rank: "AIR 50, JEE Adv. 2025",
    },
    {
      quote:
        "I got to stay home with my family & aced my JEE prep. My favourite feature was the Improvement Book, which helped track & fix all my mistakes.",
      name: "Arka Banerjee",
      rank: "AIR 395, JEE Adv. 2025",
    },
    {
      quote:
        "I wanted to stay close to family & avoid travel. The LIVE classes, NCERT-based material & quick doubt-solving helped me crack NEET with AIR 74. Best decision ever!",
      name: "Tanmay Jagga",
      rank: "AIR 74, NEET-UG 2025",
    },
    {
      quote:
        "The LIVE classes, regular tests with analysis & doubt support helped me stay focused & improve steadily. It was the discipline I needed.",
      name: "Debarghya Bag",
      rank: "AIR 247, NEET-UG 2025",
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16 tracking-tight">
          What Our Students Say
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col border border-gray-100 hover:shadow-2xl"
            >
              <span className="text-indigo-600 text-5xl mb-4">“</span>
              <p className="text-gray-700 flex-1 text-lg leading-relaxed">{t.quote}</p>
              <div className="mt-6 flex items-center space-x-4">
                <img
                  src="https://cdn.icon-icons.com/icons2/2506/PNG/512/user_icon_150670.png"
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <p className="text-gray-900 font-semibold text-lg">{t.name}</p>
                  <p className="text-indigo-600 text-sm font-medium">{t.rank}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}