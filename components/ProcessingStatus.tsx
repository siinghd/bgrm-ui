import React, { useState, useEffect } from 'react';
import { getData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import NextImage from 'next/image';

interface ProcessingStatusProps {
  taskIds: string[];
  onCompleted: (imageUrl: string) => void;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  taskIds,
  onCompleted,
}) => {
  const [statuses, setStatuses] = useState<
    Record<string, 'processing' | 'completed' | 'failed' | 'invalid'>
  >({});
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchStatus = async () => {
      const activeIds = taskIds.filter(
        (id) => !statuses[id] || statuses[id] === 'processing'
      );
      if (activeIds.length === 0) return;

      try {
        const query = activeIds.map((id) => `id=${id}`).join('&');
        const response = await getData(`/get_result?${query}`);

        if (response && Array.isArray(response)) {
          response.forEach((result) => {
            if (result.error) {
              setStatuses((prev) => ({ ...prev, [result.id]: 'failed' }));
              setImageUrls((prev) => ({ ...prev, [result.id]: null }));
            } else {
              setStatuses((prev) => ({ ...prev, [result.id]: result.status }));
              if (result.status === 'completed') {
                setImageUrls((prev) => ({
                  ...prev,
                  [result.id]: result.image_url,
                }));
                onCompleted(result.image_url);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
        activeIds.forEach((id) =>
          setStatuses((prev) => ({ ...prev, [id]: 'failed' }))
        );
      }
    };

    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [taskIds]);

  const downloadImage = (taskId: string, size: 'full' | 'half') => {
    const url = imageUrls[taskId];
    if (!url) return;

    const img = new Image();
    img.crossOrigin = 'anonymous'; // This is important for CORS
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const scaleFactor = size === 'full' ? 1 : 0.5;
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      context.fillStyle = 'transparent';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${taskId}_processed_image_${size}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        }
      }, 'image/png');
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {taskIds.map((id) => (
        <div
          key={id}
          className="bg-white dark:bg-gray-950 rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">{`Task #${id}`}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statuses[id] === 'completed'
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : statuses[id] === 'failed'
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {statuses[id] === 'completed'
                  ? 'Completed'
                  : statuses[id] === 'failed'
                  ? 'Failed'
                  : 'In Progress'}
              </span>
            </div>
          </div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {statuses[id] === 'completed' && imageUrls[id] ? (
              <NextImage
                src={imageUrls[id] || ''}
                alt="Processed Image"
                className="object-contain"
                width={300}
                height={300}
              />
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-4xl font-bold">
                -
              </div>
            )}
          </div>
          <div className="p-4 flex justify-between">
            <Button
              size="sm"
              onClick={() => downloadImage(id, 'full')}
              disabled={statuses[id] !== 'completed'}
            >
              Download Full
            </Button>
            <Button
              size="sm"
              onClick={() => downloadImage(id, 'half')}
              disabled={statuses[id] !== 'completed'}
            >
              Download Half
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProcessingStatus;
