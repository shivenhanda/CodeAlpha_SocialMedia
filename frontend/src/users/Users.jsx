import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const {
    users,
    loadUsers,
    followUser,
    unfollowUser,
    profile,
    user,
    loading
  } = useAuth();

  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        setError(null);

        await loadUsers?.(); // safe call (prevents crash if undefined)

      } catch (err) {
        console.error("Failed to load users:", err);
        if (mounted) setError("Failed to load users");
      } finally {
        if (mounted) setUsersLoading(false);
      }
    };

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, []); // IMPORTANT: empty dependency fixes repeated/missing calls

  const isFollowing = (targetId) => {
    return profile?.following?.some(
      f => (f._id || f)?.toString() === targetId?.toString()
    );
  };

  if (loading || usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 space-y-6">

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Discover Users
          </h1>

          <p className="text-gray-600 mb-8">
            Following:{" "}
            <span className="font-semibold text-purple-600">
              {profile?.followingCount || 0}
            </span>{" "}
            | Followers:{" "}
            <span className="font-semibold text-indigo-600">
              {profile?.followersCount || 0}
            </span>
          </p>

          {(!users || users.length === 0) ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
              <p className="text-lg mb-4">No users to discover yet</p>
              <p className="text-sm">Try refreshing or creating more accounts</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {users.map((u) => {
                const following = isFollowing(u._id);

                return (
                  <div
                    key={u._id}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-indigo-300"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={
                          u.profilePic ||
                          `https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff`
                        }
                        alt={u.username}
                        className="w-16 h-16 rounded-full"
                      />

                      <div>
                        <h3 className="text-xl font-bold">{u.username}</h3>
                        <p className="text-sm text-gray-600">
                          {u.bio || "No bio yet"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center bg-white p-2 rounded">
                        <div className="font-bold text-indigo-600">
                          {u.followersCount}
                        </div>
                        <div className="text-sm">Followers</div>
                      </div>

                      <div className="text-center bg-white p-2 rounded">
                        <div className="font-bold text-purple-600">
                          {u.followingCount}
                        </div>
                        <div className="text-sm">Following</div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        following
                          ? unfollowUser(u._id)
                          : followUser(u._id)
                      }
                      disabled={u._id === user?._id}
                      className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                        following
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {u._id === user?._id
                        ? "You"
                        : following
                        ? "Unfollow"
                        : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}