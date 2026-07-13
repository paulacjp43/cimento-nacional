"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UploadCloud, Trash2, Loader2, FileText, Image as ImageIcon, ExternalLink, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface Attachment {
  id: string;
  original_name: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  url: string | null;
  sector: "civil" | "eletrica" | "mecanica" | "safety" | null;
}

export function AttachmentsTab({ reportId, companyId, projectId, sector, canEdit = true }: { reportId: string, companyId: string, projectId: string, sector: string, canEdit?: boolean }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("daily_report_id", reportId)
        .eq("sector", sector as any)
        .order("created_at", { ascending: false });
        
      if (error) throw error;

      const attachmentsWithUrls = await Promise.all((data || []).map(async (att) => {
        if (!att.storage_path) return { ...att, url: null };
        const { data: urlData, error: urlError } = await supabase
          .storage
          .from("gestobra-files")
          .createSignedUrl(att.storage_path, 60 * 60);
          
        return {
          ...att,
          url: urlError ? null : urlData?.signedUrl ?? null,
        };
      }));

      setAttachments(attachmentsWithUrls as Attachment[]);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar anexos.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAttachments();
  }, [fetchAttachments]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    await uploadFile(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Usuário não autenticado");

      // Generate unique filename using crypto.randomUUID for purity compliance
      const fileExt = file.name.split(".").pop();
      const uniqueId = crypto.randomUUID();
      const uniqueFileName = `${uniqueId}.${fileExt}`;
      const storagePath = `${companyId}/${projectId}/${reportId}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gestobra-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const attachmentRecord = {
        company_id: companyId,
        project_id: projectId,
        daily_report_id: reportId,
        sector: sector as any,
        file_name: uniqueFileName,
        original_name: file.name,
        file_type: fileExt?.toLowerCase() || "unknown",
        mime_type: file.type,
        file_size_bytes: file.size,
        storage_path: storagePath,
        uploader_id: user.id,
      };

      const { error: dbError } = await supabase
        .from("attachments")
        .insert([attachmentRecord]);

      if (dbError) {
        await supabase.storage.from("gestobra-files").remove([storagePath]);
        throw dbError;
      }

      toast.success("Arquivo anexado com sucesso!");
      fetchAttachments();
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Erro ao fazer upload do arquivo.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Tem certeza que deseja apagar este anexo?")) return;
    
    try {
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("gestobra-files")
          .remove([storagePath]);
        if (storageError) console.error("Storage delete error:", storageError);
      }

      const { error: dbError } = await supabase
        .from("attachments")
        .delete()
        .eq("id", id);
        
      if (dbError) throw dbError;
      
      toast.success("Anexo removido.");
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover anexo.");
    }
  };

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center transition-colors hover:border-primary-400 dark:hover:border-primary-600">
        <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Upload de Arquivos</h3>
        <p className="text-xs text-gray-500 mb-4">Fotos (JPG, PNG), Vídeos (MP4) ou Documentos (PDF)</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,video/*,application/pdf"
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-primary"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
          ) : (
            "Selecionar Arquivo"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {attachments.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-gray-500 italic">
            Nenhum anexo adicionado ainda.
          </div>
        )}
        
        {attachments.map((att) => {
          const isImage = att.mime_type?.startsWith("image/");
          const isVideo = att.mime_type?.startsWith("video/");
          
          return (
            <div key={att.id} className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow">
              
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center border-b border-gray-200 dark:border-gray-800 overflow-hidden">
                {isImage && att.url ? (
                  <Image 
                    src={att.url} 
                    alt={att.original_name} 
                    fill 
                    className="object-cover"
                  />
                ) : isVideo && att.url ? (
                  <video 
                    src={att.url} 
                    className="object-cover w-full h-full"
                    muted
                    controls={false}
                  />
                ) : (
                  <FileText className="w-12 h-12 text-gray-400" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  {att.url && (
                    <a 
                      href={att.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-white text-gray-900 rounded-full hover:bg-primary-50 transition-colors"
                      title="Abrir arquivo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button 
                    onClick={() => handleDelete(att.id, att.storage_path)}
                    className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate" title={att.original_name}>
                  {att.original_name}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                  {isImage ? <ImageIcon className="w-3 h-3" /> : isVideo ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  <span>
                    {(att.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
