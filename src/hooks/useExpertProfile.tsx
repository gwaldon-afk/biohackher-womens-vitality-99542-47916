import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { ExpertProfile } from "@/types/experts";
import { toast } from "sonner";

export const useExpertProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpert, setIsExpert] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkExpertRole();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkExpertRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'expert')
      .single();
    
    setIsExpert(!!data);
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching expert profile:', error);
      toast.error('Failed to load expert profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (data: Partial<ExpertProfile>) => {
    if (!user) return null;

    try {
      // Generate expert ID
      const { data: expertIdData, error: idError } = await supabase
        .rpc('generate_expert_id');

      if (idError) throw idError;

      const { data: newProfile, error } = await supabase
        .from('expert_profiles')
        .insert({
          user_id: user.id,
          expert_id: expertIdData,
          email: user.email,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      // Assign expert role
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'expert',
        });

      setProfile(newProfile);
      setIsExpert(true);
      toast.success('Expert profile created successfully!');
      return newProfile;
    } catch (error: any) {
      console.error('Error creating expert profile:', error);
      toast.error(error?.message || 'Failed to create expert profile');
      return null;
    }
  };

  const updateProfile = async (updates: Partial<ExpertProfile>) => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('expert_profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      await fetchProfile();
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating expert profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  const uploadCredential = async (file: File, documentType: string) => {
    if (!user || !profile) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('expert-credentials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('expert-credentials')
        .getPublicUrl(fileName);

      const { data: credential, error: dbError } = await supabase
        .from('expert_credentials')
        .insert({
          expert_id: profile.id,
          document_type: documentType,
          document_name: file.name,
          file_path: fileName,
          file_url: publicUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Credential uploaded successfully!');
      return credential;
    } catch (error: any) {
      console.error('Error uploading credential:', error);
      toast.error(error?.message || 'Failed to upload credential');
      return null;
    }
  };

  return {
    profile,
    loading,
    isExpert,
    createProfile,
    updateProfile,
    uploadCredential,
    fetchProfile,
  };
};