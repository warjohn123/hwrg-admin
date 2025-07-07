import { supabase } from "./supabaseClient";
import { fileToBase64 } from "./toBase64";

export async function uploadFile(file: File, userId: string, bucket: string) {
  try {
    const base64 = await fileToBase64(file);

    // Strip the prefix: data:image/jpeg;base64,...
    const base64Data = base64.split(",")[1];

    // Convert to Blob
    const binary = atob(base64Data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    // Get file extension and MIME type
    const fileExt = file.name.split(".").pop();
    const blob = new Blob([array], { type: file.type });

    // Upload as ArrayBuffer
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`${bucket}/${userId}_${Date.now()}.${fileExt}`, blob, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw error;

    return data.path; // path to saved image
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}
