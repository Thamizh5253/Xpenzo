import { useState, useRef, useEffect} from 'react';
import axios from 'axios';  
import BASE_URL  from '../../config'; // Adjust the import path as necessary
import { showSuccessToast, showErrorToast } from "../../utils/toaster"; // Adjust path as needed
import { useAuth } from '../../context/AuthContext'; // Adjust the import path as necessary

const GroupCreationModal = ({ isOpen, onClose, users  ,setGroups }) => {
  const [group_name, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState( []);
  const [admins, setAdmins] = useState([]);
  const { accessToken } = useAuth(); // Use the access token from context

  const fileInputRef = useRef(null);
  
    if (!isOpen) return null;



  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const toggleAdmin = (userId) => {
    setAdmins(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };


  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const byteSlice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(byteSlice.length);
      
      for (let i = 0; i < byteSlice.length; i++) {
        byteNumbers[i] = byteSlice.charCodeAt(i);
      }
      
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    
    return new Blob(byteArrays, { type: mimeType });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('group_name', group_name);
      formData.append('description', description);
  
      if (avatarPreview) {
        const mimeType = 'image/jpeg'; // Adjust if needed
        const avatarFile = base64ToBlob(avatarPreview, mimeType);
        formData.append('avatar', avatarFile, 'avatar.jpg');
      }
  
      const memberData = selectedMembers.map(userId => ({
        user_id: userId,
        is_admin: admins.includes(userId),
        nickname: ''
      }));
  
      formData.append('members', JSON.stringify(memberData));
  
      const response = await axios.post(
        `${BASE_URL}/split/groups/create/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
  
      // Axios returns status, so check it
      if (response.status === 201) {
        showSuccessToast('Group created!');
        console.log('Group created:', response.data);
  
        // ✅ Clear the form data
        setGroupName('');
        setDescription('');
        setAvatarPreview(null);
        setSelectedMembers([]);
        setAdmins([]);
        setGroups(prev => [...prev, response.data]);

        // ✅ Close the modal
        onClose();
      } else {
        showErrorToast('Failed to create group');
        console.error('Failed to create group', response.data);
      }
  
    } catch (error) {
        showErrorToast('Error while creating group');
      console.error('Error while creating group:', error.response?.data || error.message);
    }
  };
  
  

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col"> {/* Changed height and added flex-col */}
        {/* Header - fixed */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
              <p className="text-sm text-gray-500">Organize your team or friends</p>
            </div>
            <button 
              onClick={() => {
               
                onClose();
              }
              }
              className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6"> {/* Changed to space-y-6 for consistent spacing */}
              {/* Group Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="group_name">
                  Group Name
                </label>
                <input
                  id="group_name"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="Enter group name"
                  value={group_name}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all min-h-[100px]"
                  placeholder="What's this group about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

          {/* Avatar Upload - Button Only Version */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
  <div className="flex items-center gap-3">
    {avatarPreview && (
      <div className="relative group">
        <img 
          src={avatarPreview} 
          alt="Profile preview" 
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <button
          type="button"
          onClick={() => setAvatarPreview(null)}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
          title="Remove image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    )}
    
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm ${
          avatarPreview 
            ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md"
            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {avatarPreview ? 'Change Photo' : 'Upload Photo'}
      </button>
    </div>
    
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      accept="image/*"
      onChange={handleAvatarChange}
    />
  </div>
  <p className="text-xs text-gray-500 mt-2">Supports: JPG, PNG, GIF (Max 5MB)</p>
</div>

              {/* Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                  {users.map(user => (
                    <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg mb-2 last:mb-0 transition-all ${selectedMembers.includes(user.id) ? 'bg-white shadow-xs border border-gray-100' : 'hover:bg-gray-100/50'}`}>
                      <div className="flex items-center">
                        <div 
                          onClick={() => toggleMemberSelection(user.id)}
                          className={`w-5 h-5 rounded mr-3 flex items-center justify-center cursor-pointer transition-colors ${selectedMembers.includes(user.id) ? 'bg-blue-500' : 'border-2 border-gray-300'}`}
                        >
                          {selectedMembers.includes(user.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center">
  {user.avatar ? (
    <img 
      src={user.avatar} 
      alt={user.username} 
      className="w-8 h-8 rounded-full mr-3 object-cover"
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-gray-700 font-semibold">
      {user.username?.charAt(0).toUpperCase()}
    </div>
  )}
  <span className="font-medium text-gray-800">{user.username}</span>
</div>

                      </div>
                      {selectedMembers.includes(user.id) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAdmin(user.id);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${admins.includes(user.id) ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {admins.includes(user.id) ? 'Admin' : 'Member'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions - fixed at bottom */}
            <div className="sticky bottom-0 bg-white pt-6 pb-2 -mx-6 px-6 border-t border-gray-100 mt-6">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-100 disabled:opacity-50"
                  disabled={!group_name || selectedMembers.length === 0}
                >
                  Create Group
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupCreationModal;