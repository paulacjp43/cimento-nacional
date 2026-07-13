"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { UploadCloud, Trash2, Loader2, FileText, Image as ImageIcon, ExternalLink, Video, Edit2, MapPin, Clock, User, Activity, CheckCircle, XCircle } from "lucide-react";
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
  caption?: string | null;
  location_label?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  profiles?: { full_name: string } | null;
}

export function AttachmentsTab({ reportId, companyId, projectId, sector, canEdit = true }: { reportId: string, companyId: string, projectId: string, sector: string, canEdit?: boolean }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
  
  // States for the edit form
  const [editCaption, setEditCaption] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("attachments")
        .select(`
          *,
          profiles!attachments_uploader_id_fkey(full_name)
        `)
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

      // Try to get GPS coordinates (timeout 3s to not block upload too long)
      let lat = null;
      let lng = null;
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (e) {
          console.log("GPS not captured", e);
        }
      }

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
        latitude: lat,
        longitude: lng,
      };

      const { error: dbError } = await supabase
        .from("attachments")
        .insert([attachmentRecord]);

      if (dbError) {
        await supabase.storage.from("gestobra-files").remove([storagePath]);
        throw dbError;
      }

      toast.success("Foto inteligente enviada com sucesso!");
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

  const openEditModal = (att: Attachment) => {
    setEditingAttachment(att);
    setEditCaption(att.caption || "");
    setEditLocation(att.location_label || "");
    setEditDescription(att.description || "");
  };

  const saveMetadata = async () => {
    if (!editingAttachment) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("attachments")
        .update({
          caption: editCaption || null,
          location_label: editLocation || null,
          description: editDescription || null,
        })
        .eq("id", editingAttachment.id);

      if (error) throw error;

      toast.success("Detalhes salvos com sucesso!");
      
      // Update local state
      setAttachments(prev => prev.map(a => 
        a.id === editingAttachment.id 
          ? { ...a, caption: editCaption, location_label: editLocation, description: editDescription }
          : a
      ));
      
      setEditingAttachment(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar os detalhes.");
    } finally {
      setSavingEdit(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="bg-gray-50 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center transition-colors hover:border-primary-400 dark:hover:border-primary-600">
        <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Upload de Fotos Inteligentes</h3>
        <p className="text-xs text-gray-500 mb-4">Envie fotos e preencha os detalhes (Local, Atividade, etc.)</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,video/*,application/pdf"
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !canEdit}
          className="btn btn-primary"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
          ) : (
            "Selecionar Arquivo"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {attachments.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-gray-500 italic">
            Nenhuma foto adicionada ainda.
          </div>
        )}
        
        {attachments.map((att, index) => {
          const isImage = att.mime_type?.startsWith("image/");
          const isVideo = att.mime_type?.startsWith("video/");
          
          return (
            <div key={att.id} className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center overflow-hidden">
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
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  {canEdit && (
                    <button 
                      onClick={() => openEditModal(att)}
                      className="p-2.5 bg-white text-gray-900 rounded-full hover:bg-primary-50 transition-colors shadow-lg"
                      title="Editar Detalhes"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                  {att.url && (
                    <a 
                      href={att.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white text-gray-900 rounded-full hover:bg-primary-50 transition-colors shadow-lg"
                      title="Abrir imagem inteira"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                  {canEdit && (
                    <button 
                      onClick={() => handleDelete(att.id, att.storage_path)}
                      className="p-2.5 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md">
                  FOTO {(attachments.length - index).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col text-sm border-t border-gray-100 dark:border-gray-800">
                <p className="font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight line-clamp-2">
                  {att.caption || <span className="text-gray-400 italic font-normal">Sem legenda</span>}
                </p>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                    <Activity className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{att.description || "—"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="truncate">{att.location_label || "—"}</span>
                    {att.latitude && att.longitude && (
                      <a 
                        href={`https://www.google.com/maps?q=${att.latitude},${att.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-[10px] text-blue-500 hover:underline ml-1"
                        title="Ver no mapa"
                      >
                        (GPS)
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5" title="Horário do upload">
                      <Clock className="w-3 h-3" /> {formatTime(att.created_at)}
                    </div>
                    <div className="flex items-center gap-1.5" title="Responsável pelo upload">
                      <User className="w-3 h-3" /> {att.profiles?.full_name?.split(' ')[0] || "Desconhecido"}
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingAttachment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary-500" />
                Editar Detalhes da Foto
              </h3>
              <button onClick={() => setEditingAttachment(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Legenda da Foto
                </label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  className="input text-sm"
                  placeholder="Ex: Armação da laje concluída"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Local / Sub-área
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="input text-sm"
                  placeholder="Ex: Prédio 532, 2º Andar"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Atividade Vinculada
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="input text-sm"
                  placeholder="Ex: Concretagem dos pilares"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingAttachment(null)}
                className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button 
                onClick={saveMetadata}
                disabled={savingEdit}
                className="btn btn-sm btn-primary min-w-[100px] justify-center"
              >
                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-1.5" /> Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
