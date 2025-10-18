import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useExpertProfile } from "@/hooks/useExpertProfile";
import { supabase } from "@/integrations/supabase/client";
import { ExpertCredential } from "@/types/experts";
import { Upload, FileText, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ExpertCredentialsManagerProps {
  expertId: string;
}

const DOCUMENT_TYPES = [
  'license',
  'insurance',
  'certification',
  'degree',
  'other'
];

export const ExpertCredentialsManager = ({ expertId }: ExpertCredentialsManagerProps) => {
  const { uploadCredential } = useExpertProfile();
  const [credentials, setCredentials] = useState<ExpertCredential[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('license');

  useEffect(() => {
    fetchCredentials();
  }, [expertId]);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expert_credentials')
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadCredential(selectedFile, documentType);
      if (result) {
        setSelectedFile(null);
        await fetchCredentials();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expert_credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Credential deleted');
      fetchCredentials();
    } catch (error: any) {
      console.error('Error deleting credential:', error);
      toast.error(error?.message || 'Failed to delete credential');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credentials & Documents</CardTitle>
        <CardDescription>Upload and manage your professional credentials</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Document Type</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select File</label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Accepted formats: PDF, JPG, PNG (Max 10MB)
              </p>
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </CardContent>
        </Card>

        {/* Credentials List */}
        <div className="space-y-3">
          <h4 className="font-semibold">Uploaded Documents</h4>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading credentials...</p>
          ) : credentials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No credentials uploaded yet</p>
          ) : (
            credentials.map((cred) => (
              <div key={cred.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{cred.document_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{cred.document_type}</p>
                  </div>
                  {cred.verified ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(cred.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};