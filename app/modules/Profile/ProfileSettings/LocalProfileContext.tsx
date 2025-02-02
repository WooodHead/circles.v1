import { storeImage } from "@/app/common/utils/ipfs";
import useProfileUpdate from "@/app/services/Profile/useProfileUpdate";
import { UserType } from "@/app/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";

type ProfileSettingsType = {
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAvatar: React.Dispatch<React.SetStateAction<string>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setTwitter: React.Dispatch<React.SetStateAction<string>>;
  setGithub: React.Dispatch<React.SetStateAction<string>>;
  setBehance: React.Dispatch<React.SetStateAction<string>>;
  setWebsite: React.Dispatch<React.SetStateAction<string>>;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
  email: string;
  avatar: string;
  uploading: boolean;
  loading: boolean;
  username: string;
  bio: string;
  skills: string[];
  isDirty: boolean;
  uploadFile: (file: File) => void;
  onSaveProfile: () => void;
  twitter: string;
  github: string;
  behance: string;
  website: string;
};

export const LocalProfileContext = createContext<ProfileSettingsType>(
  {} as ProfileSettingsType
);

export function useProviderLocalProfile() {
  const { data: currentUser, isLoading } = useQuery<UserType>("getMyUser", {
    enabled: false,
  });

  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState([] as string[]);
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [behance, setBehance] = useState("");
  const [website, setWebsite] = useState("");

  const [isDirty, setIsDirty] = useState(false);

  const { updateProfile } = useProfileUpdate();

  const [loading, setLoading] = useState(true);

  const uploadFile = async (file: File) => {
    setIsDirty(true);
    if (file) {
      setUploading(true);
      const { imageGatewayURL } = await storeImage(file);
      console.log({ imageGatewayURL });
      setAvatar(imageGatewayURL);
      setUploading(false);
    }
  };

  const onSaveProfile = async () => {
    setLoading(true);
    const res = await updateProfile({
      username,
      avatar,
      bio,
      skills,
      email,
      twitter,
      github,
      behance,
      website,
    });
    console.log(res);
    setLoading(false);
    setIsDirty(false);
  };

  useEffect(() => {
    setLoading(true);
    setAvatar(currentUser?.avatar || "");
    setUsername(currentUser?.username || "");
    setBio(currentUser?.bio || "");
    setEmail(currentUser?.email || "");
    setTwitter(currentUser?.twitter || "");
    setGithub(currentUser?.github || "");
    setBehance(currentUser?.behance || "");
    setWebsite(currentUser?.website || "");
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isLoading]);

  return {
    uploading,
    setUploading,
    avatar,
    setAvatar,
    username,
    setUsername,
    email,
    setEmail,
    bio,
    setBio,
    skills,
    setSkills,
    twitter,
    setTwitter,
    github,
    setGithub,
    behance,
    setBehance,
    website,
    setWebsite,
    loading,
    setLoading,
    isDirty,
    setIsDirty,
    uploadFile,
    onSaveProfile,
  };
}
export const useProfile = () => useContext(LocalProfileContext);
