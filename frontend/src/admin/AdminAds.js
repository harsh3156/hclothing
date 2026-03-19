import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AdminAds.css";

const AdminAds = () => {
  const { user } = useContext(AuthContext);
  const [ads, setAds] = useState([]);
  const [file, setFile] = useState(null);

  // fetch ads
  const fetchAds = async () => {
    const { data } = await axios.get("http://localhost:5000/api/ads");
    setAds(data);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // upload ad
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post("http://localhost:5000/api/ads", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`, // ✅ send token
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Ad uploaded");
      setFile(null);
      fetchAds();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload ad");
    }
  };

  // delete ad
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ad?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/ads/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }, // ✅ send token
      });
      alert("Ad deleted");
      fetchAds();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete ad");
    }
  };

  return (
    <div className="ads-container">
      <h2>Manage Advertisements</h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept="image/*"
        />
        <button type="submit">Upload Ad</button>
      </form>

      {/* Show Ads */}
      <div className="ads-list">
        {ads.map((ad) => (
          <div key={ad._id} className="ad-item">
            <img
              src={`http://localhost:5000/public/images/ads/${ad.image}`}
              alt="Ad"
              className="ad-image"
            />
            <button
              className="delete-btn"
              onClick={() => handleDelete(ad._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAds;
