import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
}

export interface FileUploadRef {
  triggerFileSelect: () => void;
}

const defaultAcceptedTypes = {
  'image/*': []
};

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(({
  onFileSelect,
  maxFiles = 5,
  acceptedFileTypes = defaultAcceptedTypes
}, ref) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    triggerFileSelect: () => {
      inputRef.current?.click();
    }
  }));

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    
    // Generate preview URLs
    const newPreviewUrls = acceptedFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    onFileSelect(newFiles);
  }, [files, maxFiles, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    noClick: true // Disable the default click behavior
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    // Remove preview URL if it exists
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);
    
    onFileSelect(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-500 hover:bg-teal-50'}`}
      >
        <input 
          {...getInputProps()} 
          ref={inputRef}
          type="file"
          multiple
          accept={Object.keys(acceptedFileTypes).join(',')}
          style={{ display: 'none' }}
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        {isDragActive ? (
          <p className="text-teal-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-slate-600">Drag and drop files here, or click to select files</p>
            <p className="text-sm text-slate-500 mt-1">
              Supported formats: Images
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700">Selected Files:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-white rounded-lg border border-slate-200"
              >
                {previewUrls[index] ? (
                  <img
                    src={previewUrls[index]}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  getFileIcon(file)
                )}
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default FileUpload; 