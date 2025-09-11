import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate , Navigate} from "react-router-dom";

export default function TrendingCourses() {
  const navigate = useNavigate();
  return (
    <section className="w-full py-16">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-10">
          Trending Courses
        </h2>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-10">
          <button onClick = {() => {navigate("/user/explore")}} className="px-4 py-2 rounded-full bg-white shadow text-gray-700 hover:bg-gray-100">
            NEET
          </button>
          <button className="px-4 py-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700">
            JEE
          </button>
          <button onClick = {() => {navigate("/user/explore")}} className="px-4 py-2 rounded-full bg-white shadow text-gray-700 hover:bg-gray-100">
            Class 6–10
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Course 1 */}
          <Card className="rounded-2xl shadow-lg p-6 bg-white relative">
            <div className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">
              RECORDED
            </div>
            <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-3 py-1 rounded">
              SCHOLARSHIP ELIGIBLE
            </div>
            <CardContent className="mt-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                JEE Enthusiast Self Study Plus Course
              </h3>
              <p className="text-sm text-gray-500 mb-4">Target 2026</p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✔ Latest recordings covering full syllabus</li>
                <li>✔ Digital study material incl. books, RACE & more</li>
                <li>✔ 32 (part + full) syllabus tests</li>
              </ul>
              <p className="mt-4 font-semibold text-lg">
                ₹16,900 <span className="text-sm font-normal text-gray-500">+ Taxes applicable</span>
              </p>
              <Button onClick = {() => {navigate("/user/explore")}} variant="link" className="text-blue-600 mt-2 p-0">
                Know more →
              </Button>
            </CardContent>
          </Card>

          {/* Course 2 */}
          <Card className="rounded-2xl shadow-lg p-6 bg-white relative">
            <div className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">
              LIVE
            </div>
            <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-3 py-1 rounded">
              UPTO 90% SCHOLARSHIP
            </div>
            <CardContent className="mt-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                JEE Leader Online Course
              </h3>
              <p className="text-sm text-gray-500 mb-4">Target 2026</p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✔ Live classes from ALLEN Kota’s top faculty</li>
                <li>✔ Upto 35 online tests</li>
                <li>✔ 24/7 doubt support, academic guidance & more</li>
              </ul>
              <p className="mt-4 font-semibold text-lg">
                <span className="line-through text-gray-400 text-sm">₹93,500</span> ₹89,000
                <span className="text-sm font-normal text-gray-500"> + Taxes applicable</span>
              </p>
              <Button onClick = {() => {navigate("/user/explore")}} variant="link" className="text-blue-600 mt-2 p-0">
                Know more →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-12">
          <Button onClick = {() => {navigate("/user/explore")}} className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700">
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  );
}