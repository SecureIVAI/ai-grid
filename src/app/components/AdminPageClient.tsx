"use client";

import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

export default function AdminPageClient({
  users: initialUsers,
  logs,
  currentUserId,
}: {
  users: User[];
  logs: AuditLog[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<"users" | "logs">("users");
  const [users, setUsers] = useState(initialUsers);
  const [editedRoles, setEditedRoles] = useState<{ [id: string]: string }>({});
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(
    new Set()
  );
  const [passwordEdits, setPasswordEdits] = useState<{ [id: string]: string }>(
    {}
  );
  const [activeResetField, setActiveResetField] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // update selected role in memory
  const handleRoleChange = (id: string, newRole: string) => {
    setEditedRoles((prev) => ({ ...prev, [id]: newRole }));
  };

  // toggle checkbox state for deleting a user
  const handleCheckboxToggle = (id: string) => {
    setMarkedForDeletion((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  // confirm all role changes and deletions
  const handleConfirmChanges = async () => {
    const updates = Object.entries(editedRoles);

    for (const [id, role] of updates) {
      await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
    }

    for (const id of markedForDeletion) {
      await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }

    // update local list after server sync
    const updatedUsers = users
      .map((user) =>
        editedRoles[user.id] ? { ...user, role: editedRoles[user.id] } : user
      )
      .filter((user) => !markedForDeletion.has(user.id));
    showSuccess("Changes saved successfully.");
    setUsers(updatedUsers);
    setEditedRoles({});
    setMarkedForDeletion(new Set());
  };

  // handle password reset via api
  const handleResetPassword = async (id: string) => {
    const newPassword = passwordEdits[id];
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newPassword }),
    });

    if (res.ok) {
      showSuccess("Password reset successfully.");
      setPasswordEdits((prev) => ({ ...prev, [id]: "" }));
      setActiveResetField(null);
    } else {
      showSuccess("Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-semibold mb-8 text-gray-800">
          Admin Dashboard
        </h1>
        {successMessage && (
          <div className="mb-4 text-blue-700 bg-blue-100 px-4 py-2 rounded-md text-sm font-medium border border-blue-300">
            {successMessage}
          </div>
        )}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("users")}
            className={`px-5 py-2 rounded-full transition-all font-medium ${
              tab === "users"
                ? "bg-blue-600 text-white shadow"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`px-5 py-2 rounded-full transition-all font-medium ${
              tab === "logs"
                ? "bg-blue-600 text-white shadow"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            View Audit Logs
          </button>
        </div>

        {tab === "users" && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {user.name}{" "}
                          <span className="text-gray-500">— {user.email}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {user.createdAt}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <select
                          className="px-2 py-1 border text-sm rounded-md bg-white"
                          value={editedRoles[user.id] || user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="reviewer">Reviewer</option>
                        </select>

                        {activeResetField === user.id ? (
                          <>
                            <input
                              type="password"
                              placeholder="New Password"
                              value={passwordEdits[user.id] || ""}
                              onChange={(e) =>
                                setPasswordEdits((prev) => ({
                                  ...prev,
                                  [user.id]: e.target.value,
                                }))
                              }
                              className="px-2 py-1 border rounded-md text-sm"
                            />
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => setActiveResetField(null)}
                              className="text-gray-500 text-sm hover:underline"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setActiveResetField(user.id)}
                            className="text-indigo-600 text-sm hover:underline"
                          >
                            Reset Password
                          </button>
                        )}
                        {user.id === currentUserId ? (
                          <span className="text-indigo-600 text-sm font-medium">
                            Currently Signed In
                          </span>
                        ) : (
                          <label className="inline-flex items-center text-sm text-red-600 font-medium">
                            <input
                              type="checkbox"
                              className="w-4 h-4 mr-2"
                              checked={markedForDeletion.has(user.id)}
                              onChange={() => handleCheckboxToggle(user.id)}
                              disabled={user.id === currentUserId} // prevent self-delete
                            />
                            {user.id === currentUserId
                              ? "Can't Remove Yourself"
                              : "Remove"}
                          </label>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {(Object.keys(editedRoles).length > 0 ||
              markedForDeletion.size > 0) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleConfirmChanges}
                  className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
                >
                  Confirm Changes
                </button>
              </div>
            )}
          </>
        )}

        {tab === "logs" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ul className="divide-y divide-gray-200">
              {logs.map((log) => (
                <li key={log.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {log.user}{" "}
                        <span className="text-gray-500">— {log.action}</span>
                      </p>
                      <p className="text-xs text-gray-400">{log.timestamp}</p>
                    </div>
                    <span className="text-xs text-gray-400">#{log.id}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
