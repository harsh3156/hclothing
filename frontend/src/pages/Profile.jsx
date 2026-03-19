import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getProfile, updateProfile } from "../api/userService";
import "./Profile.css";

// ✅ Strict Gmail validation (lowercase + letter + number + @gmail.com)
const GMAIL_REGEX = /^[a-z0-9._%+-]+@gmail\.com$/;

const Profile = () => {
  const { user, updateUserContext } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [updateMessage, setUpdateMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // --- Fetch Profile ---
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getProfile(user.token);
        setProfile(data);
        setFormData({ name: data.name || "", email: data.email || "" });
      } catch (err) {
        setError(err.message || "Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user?.token]);

  // --- Input Change ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  // --- Validation ---
  const validateForm = () => {
    const errors = {};
    let { name, email } = formData;
    name = name.trim();
    email = email.trim();

    // ✅ Name validation: only letters and at least 3 chars
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name) {
      errors.name = "Name is required.";
    } else if (!nameRegex.test(name)) {
      errors.name = "Name should contain only letters (A–Z, a–z).";
    } else if (name.length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    }

    // ✅ Email validation
    const uppercaseCheck = /[A-Z]/.test(email);
    if (!email) {
      errors.email = "Email is required.";
    } else if (uppercaseCheck) {
      errors.email = "Email must contain only lowercase characters.";
    } else if (!GMAIL_REGEX.test(email)) {
      errors.email =
        "Email must be a valid Gmail address (e.g., user123@gmail.com) with letters & numbers.";
    } else {
      // Check if part before @ has both letters and numbers
      const emailUserPart = email.split("@")[0];
      const hasLetter = /[a-z]/.test(emailUserPart);
      const hasNumber = /[0-9]/.test(emailUserPart);
      if (!hasLetter || !hasNumber) {
        errors.email =
          "Email must contain at least one letter and one number before '@'.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Submit Update ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateMessage(null);

    if (!validateForm()) {
      setUpdateMessage({
        type: "error",
        text: "Please correct the validation errors.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (
        formData.name === profile.name &&
        formData.email === profile.email
      ) {
        setUpdateMessage({ type: "info", text: "No changes detected." });
        setIsEditing(false);
        setIsSubmitting(false);
        return;
      }

      const data = await updateProfile(formData, user.token);

      setProfile(data);
      updateUserContext({
        ...user,
        name: data.name,
        email: data.email,
      });

      setUpdateMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setIsEditing(false);
    } catch (err) {
      setUpdateMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to update profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user)
    return (
      <div className="profile-wrapper">
        <p className="profile-error">🔒 Please log in to view your profile.</p>
      </div>
    );

  if (loading)
    return (
      <div className="profile-wrapper">
        <p className="profile-status">⏳ Loading profile...</p>
      </div>
    );

  if (error || !profile)
    return (
      <div className="profile-wrapper">
        <p className="profile-error">❌ {error}</p>
      </div>
    );

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <h2>My Profile</h2>
        <hr className="profile-divider" />

        {updateMessage && (
          <p className={`update-message update-message-${updateMessage.type}`}>
            {updateMessage.text}
          </p>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name (Only letters):</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                aria-invalid={!!validationErrors.name}
              />
              {validationErrors.name && (
                <p className="validation-error">{validationErrors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email (lowercase, must include letters & numbers, and end with
                @gmail.com):
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-invalid={!!validationErrors.email}
              />
              {validationErrors.email && (
                <p className="validation-error">{validationErrors.email}</p>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={isSubmitting}
                className="save-btn"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: profile.name,
                    email: profile.email,
                  });
                  setValidationErrors({});
                  setUpdateMessage(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <p>
              <b>Name:</b>{" "}
              <span className="profile-value">{profile.name}</span>
            </p>
            <p>
              <b>Email:</b>{" "}
              <span className="profile-value">{profile.email}</span>
            </p>
            <p>
              <b>Role:</b>{" "}
              <span className="profile-value profile-role">
                {profile.isAdmin ? "Admin" : "User"}
              </span>
            </p>
            <button
              onClick={() => {
                setIsEditing(true);
                setUpdateMessage(null);
              }}
              className="edit-btn"
            >
              ✏️ Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
