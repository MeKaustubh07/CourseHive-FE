import { useState } from "react";
import axios from "axios";

export default function CourseForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("admin_token"); // stored at login

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit form + files in one request
  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price) {
      alert("Please fill all fields");
      return;
    }
    if (!thumbnail || !video) {
      alert("Please select both thumbnail & video files");
      return;
    }
  
    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("price", form.price);
  
      // ✅ Updated field names to match backend (thumbnailUrl, videoUrl)
      if (thumbnail) {
        data.append("thumbnailUrl", thumbnail);  // must be File object
      }
      if (video) {
        data.append("videoUrl", video);          // must be File object
      }
  
      console.log("🚀 Submitting Course Data:");
      console.log("Title:", form.title);
      console.log("Description:", form.description);
      console.log("Price:", form.price);
      console.log("Thumbnail file:", thumbnail);
      console.log("Video file:", video);
      console.log("🔑 Token being sent:", token ? token : "❌ No token found in localStorage");
  
      const res = await axios.post("http://localhost:3000/api/admin/addcourse", data, {
        headers: {
          Authorization: `Bearer ${token}`,
         "Content-Type": "multipart/form-data",
        },
      });
  
      alert("✅ Course Created Successfully!");
      console.log("📦 Server Response:", res.data);
  
      // Reset form
      setForm({ title: "", description: "", price: "" });
      setThumbnail(null);
      setVideo(null);
    } catch (err) {
      console.error("❌ Error creating course:", err);
      if (err.response) {
        console.error("🔍 Server Response:", err.response.data);
        console.error("🔍 Status:", err.response.status);
        console.error("🔍 Headers:", err.response.headers);
      }
      alert("❌ Failed to create course - check console for details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Stepper like UI */}
      <div className="flex gap-2 mb-6 text-gray-600">
        <span className="font-medium text-purple-600">1. Course Information</span>
        <span>› Upload Materials</span>
        <span>› Pricing</span>
        <span>› Publish</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Course Information</h2>

          <input
            type="text"
            name="title"
            placeholder="Course Title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mb-4"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="w-full border rounded-lg p-2 mb-4"
          />

          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mb-4"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            {loading ? "Creating..." : "Save & Continue"}
          </button>
        </div>

        {/* Right Column */}
        <div>
          <div className="mb-6">
            <h3 className="font-medium mb-2">Cover Image</h3>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
              {thumbnail && (
                <p className="mt-2 text-sm text-gray-600">{thumbnail.name}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Sales Video</h3>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
              />
              {video && (
                <p className="mt-2 text-sm text-gray-600">{video.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}