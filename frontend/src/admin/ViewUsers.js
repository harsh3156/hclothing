import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAllUsers } from "../api/userService";
import "./ViewUsers.css"; // ✅ Import the matching CSS

const ViewUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("all");

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAllUsers(user.token);
      setUsers(data);
    } catch (err) {
      alert("Failed to fetch users");
    }
  }, [user.token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtering logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAdminFilter =
        filterAdmin === "all" ||
        (filterAdmin === "admin" && u.isAdmin) ||
        (filterAdmin === "non-admin" && !u.isAdmin);

      return matchesSearch && matchesAdminFilter;
    });
  }, [users, searchTerm, filterAdmin]);

  return (
    <div className="view-users-page">
      <div className="view-users-container">
        <h2>All Users ({filteredUsers.length} found)</h2>

        {/* Search and Filter Controls */}
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins Only</option>
            <option value="non-admin">Non-Admins Only</option>
          </select>
        </div>

        {/* Users Table */}
        <table className="view-users-table">
          <thead>
            <tr>
              <th>UserID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id}>
                <td className="user-id-cell">{u._id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td className="admin-cell">
                  {u.isAdmin ? (
                    <span className="admin-icon check">✅</span>
                  ) : (
                    <span className="admin-icon cross">❌</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewUsers;
