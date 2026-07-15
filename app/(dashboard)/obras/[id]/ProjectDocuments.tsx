"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Upload, Trash2, Loader2, Download } from "lucide-react";

interface ProjectDocument {
  id: string;
  name: string;
  file_url: string;
  size_bytes: number;
  created_at: string;
}

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from("project_documents" as any)
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments((data as any) || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, selecione apenas arquivos PDF.");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `projects/${projectId}/documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gestobra-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("project_documents" as any)
        .insert({
          project_id: projectId,
          name: file.name,
          file_url: filePath,
          size_bytes: file.size,
          created_by: user.id
        } as any);

      if (insertError) throw insertError;

      await fetchDocuments();
      
      // Clear input
      event.target.value = '';
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Erro ao fazer upload do documento.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: ProjectDocument) {
    if (!confirm(`Deseja realmente excluir o documento "${doc.name}"?`)) return;

    try {
      // 1. Remove from storage
      await supabase.storage.from("gestobra-files").remove([doc.file_url]);

      // 2. Remove from database
      const { error } = await supabase
        .from("project_documents" as any)
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      setDocuments(docs => docs.filter(d => d.id !== doc.id));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Erro ao excluir o documento.");
    }
  }

  async function handleDownload(doc: ProjectDocument) {
    const { data } = supabase.storage
      .from("gestobra-files")
      .getPublicUrl(doc.file_url);
      
    window.open(data.publicUrl, '_blank');
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          Documentos em PDF
        </h2>
        
        <div>
          <input
            type="file"
            id="doc-upload"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label
            htmlFor="doc-upload"
            className={`btn btn-primary btn-sm cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Novo Documento</>
            )}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Nenhum documento</p>
          <p className="text-xs text-muted-foreground mt-1">
            Faça upload de projetos, plantas, alvarás ou outros PDFs relacionados à obra.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 transition-colors group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-md shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate" title={doc.name}>
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBytes(doc.size_bytes)} • {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                  title="Baixar/Visualizar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
