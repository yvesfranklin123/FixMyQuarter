import { useUploadStore } from "@/store/use-upload-store";
import { driveService } from "@/services/drive.service";
import { toast } from "@/components/ui/use-toast";

export const useFileUpload = () => {
  const { addUpload, updateProgress, markCompleted, markError } = useUploadStore();

  const upload = async (file: File, folderId?: string | null) => {
    const uploadId = addUpload(file, folderId);

    try {
      await driveService.uploadFile(file, folderId, (progress) => {
        updateProgress(uploadId, progress);
      });
      markCompleted(uploadId);
      toast({ title: "Succès", description: `${file.name} a été envoyé.` });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Erreur lors de l'envoi";
      markError(uploadId, errorMsg);
      toast({ variant: "destructive", title: "Erreur", description: errorMsg });
    }
  };

  return { upload };
};