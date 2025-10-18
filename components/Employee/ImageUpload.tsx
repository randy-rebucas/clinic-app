'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Camera } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  employeeId: string;
}

export default function ImageUpload({ 
  currentImage, 
  onImageUpload, 
  onError, 
  disabled = false,
  employeeId
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`/api/employee/upload-picture?id=${employeeId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onImageUpload(data.profilePicture);
      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      onError(error instanceof Error ? error.message : 'Upload failed');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreview(null);
  };

  const displayImage = preview || currentImage;

  return (
    <div className="space-y-4">
      {/* Current/Preview Image */}
      {displayImage && (
        <div className="relative inline-block">
          <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
            <Image
              src={displayImage}
              alt="Profile preview"
              width={96}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span className="text-sm">
                {displayImage ? 'Change Picture' : 'Upload Picture'}
              </span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF. Max size: 5MB
        </p>
      </div>
    </div>
  );
}
