'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { postData } from '@/lib/api';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadSuccess: (ids: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<{
    [id: string]: string;
  }>({});

  const handleUpload = async () => {
    setIsUploading(true);
    const taskIds: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await postData('/remove_background', formData);
        taskIds.push(response.id);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    onUploadSuccess(taskIds);
    setFiles([]);
    setIsUploading(false);
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length + files.length <= 5) {
      setFiles([...files, ...newFiles]);
    } else {
      alert('You can upload a maximum of 5 images.');
    }
  };

  const handleProcessedImage = (id: string, imageUrl: string) => {
    setProcessedImages((prevProcessedImages) => ({
      ...prevProcessedImages,
      [id]: imageUrl,
    }));
  };

  return (
    <div>
      <Input
        id="picture"
        type="file"
        accept="image/*"
        disabled={isUploading}
        onChange={handleFilesChange}
        multiple
      />
      {files.length > 0 && (
        <div>
          <p>Selected files:</p>
          <div className="grid grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="flex flex-col items-center">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  width={200}
                  height={200}
                />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Start Background Removal'}
          </Button>
        </div>
      )}
      {Object.keys(processedImages).length > 0 && (
        <div>
          <h2>Processed Images:</h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(processedImages).map(([id, imageUrl]) => (
              <div key={id} className="flex flex-col items-center">
                <Image
                  src={imageUrl}
                  alt="Processed Image"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
