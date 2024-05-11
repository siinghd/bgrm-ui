'use client';
import { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ProcessingStatus from '../components/ProcessingStatus';

const ClientHome: React.FC = () => {
  const [taskIds, setTaskIds] = useState<string[]>([]);

  const handleUploadSuccess = (ids: string[]) => {
    setTaskIds(ids);
  };

  const handleCompleted = (imageUrl: string) => {
    console.log('Image URL:', imageUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Background Removal App</h1>
      <ImageUpload onUploadSuccess={handleUploadSuccess} />
      {taskIds.length > 0 && (
        <ProcessingStatus taskIds={taskIds} onCompleted={handleCompleted} />
      )}
    </div>
  );
};

export default ClientHome;
