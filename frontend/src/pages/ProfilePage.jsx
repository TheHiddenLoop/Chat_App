"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Camera,
  Mail,
  User,
  ScrollText,
  PenSquare,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [about, setAbout] = useState(authUser?.about || "");

  // Update local state when authUser changes
  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setAbout(authUser.about || "");
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Allowed extensions
    const allowedExtensions = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedExtensions.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a PNG, JPG, or WEBP image."
      );
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      try {
        // Only update the profile picture
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated successfully");
      } catch (error) {
        // Error is already handled in the store
      }
    };
  };

  const handleSaveName = async () => {
    if (fullName.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      // Only update the name
      await updateProfile({ fullName });
      setIsEditingName(false);
      toast.success("Name updated successfully");
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleSaveAbout = async () => {
    try {
      // Only update the about field
      await updateProfile({ about });
      setIsEditingAbout(false);
      toast.success("About information updated successfully");
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleCancelEdit = (field) => {
    if (field === "name") {
      setFullName(authUser?.fullName || "");
      setIsEditingName(false);
    } else if (field === "about") {
      setAbout(authUser?.about || "");
      setIsEditingAbout(false);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="relative">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                      placeholder="Enter your full name"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      disabled={isUpdatingProfile}
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelEdit("name")}
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      disabled={isUpdatingProfile}
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-2.5 bg-base-200 rounded-lg border flex justify-between items-center">
                    <span>{authUser?.fullName}</span>
                    <button
                      onClick={() => {
                        setFullName(authUser?.fullName || "");
                        setIsEditingName(true);
                      }}
                      className="text-zinc-400 hover:text-zinc-100 transition-colors"
                      disabled={isUpdatingProfile}
                    >
                      <PenSquare className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <ScrollText className="w-4 h-4" />
                About
              </div>
              <div className="relative">
                {isEditingAbout ? (
                  <div className="flex items-start gap-2">
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="px-4 py-2.5 bg-base-200 rounded-lg border w-full min-h-[100px] resize-none"
                      placeholder="Tell us about yourself"
                      rows={1}
                    />

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleSaveAbout}
                        className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        disabled={isUpdatingProfile}
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancelEdit("about")}
                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        disabled={isUpdatingProfile}
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2.5 bg-base-200 rounded-lg border flex justify-between items-start">
                    <span className="whitespace-pre-wrap">
                      {authUser?.about || "No information provided"}
                    </span>
                    <button
                      onClick={() => {
                        setAbout(authUser?.about || "");
                        setIsEditingAbout(true);
                      }}
                      className="text-zinc-400 hover:text-zinc-100 transition-colors"
                      disabled={isUpdatingProfile}
                    >
                      <PenSquare className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
