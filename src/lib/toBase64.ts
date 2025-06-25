export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("FileReader result is not a string");
      }
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
}
