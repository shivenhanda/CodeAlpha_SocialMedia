
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { profile, user, updateProfile, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setProfilePic(profile.profilePic || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ bio, profilePic });
    if (result.success) {
      setEditing(false);
    } else {
      alert(result.message || 'Update failed');
    }
    setSaving(false);
  };

  if (loading || !user || !profile) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div>Loading profile...</div></div>;
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-10 mb-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-xl text-gray-600 mt-2">Manage your account and connections</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setEditing(!editing)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={saving}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <Link
                to="/posts"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                📝 My Posts
              </Link>
            </div>
          </div>


          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center mb-8 md:mb-0">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 p-1 mb-4">
                <img
                  src={profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=128`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {editing && (
                <input
                  type="url"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  placeholder="Profile picture URL"
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="text-2xl font-bold text-gray-900">{user.username}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{profile.followersCount}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{profile.followingCount}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {editing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-lg text-gray-800 p-4 bg-gray-50 rounded-xl min-h-[80px] flex items-center">
                    {bio || 'No bio yet. Add one to share your story!'}
                  </p>
                )}
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

