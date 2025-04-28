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

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Avatar</label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Group avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {avatarPreview ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    {avatarPreview && (
                      <button
                        type="button"
                        className="ml-2 text-sm text-red-500 hover:text-red-600"
                        onClick={() => setAvatarPreview(null)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
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
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full mr-3 object-cover"
                          />
                          <span className="font-medium text-gray-800">{user.name}</span>
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