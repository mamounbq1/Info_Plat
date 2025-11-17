import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { validateImageFile } from '../utils/fileUpload';

/**
 * Reusable Image Upload Field Component with Drag & Drop
 * @param {string} label - Field label
 * @param {string} value - Current image URL
 * @param {Function} onChange - Callback when file is selected (receives File object)
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} folder - Storage folder (for display purposes)
 * @param {string} className - Additional CSS classes
 */
export default function ImageUploadField({
  label,
  value = '',
  onChange,
  required = false,
  disabled = false,
  folder = 'images',
  className = ''
}) {
  const { isArabic } = useLanguage();
  const [preview, setPreview] = useState(value || '');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(isArabic ? getArabicError(validation.error) : validation.error);
      return;
    }

    // Clear error
    setError('');

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Call parent onChange with File object
    if (onChange) {
      onChange(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
  };

  const handleChange = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const getArabicError = (error) => {
    if (error.includes('Invalid file type')) {
      return 'نوع الملف غير صالح. يُسمح فقط بـ JPG و PNG و GIF و WebP.';
    }
    if (error.includes('too large')) {
      return 'الملف كبير جدًا. الحجم الأقصى: 5 ميجابايت.';
    }
    return error;
  };

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg transition-all cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {preview ? (
          /* Preview Mode */
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {/* Overlay on hover */}
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleChange}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  {isArabic ? 'تغيير' : 'Change'}
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 flex items-center gap-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                  {isArabic ? 'حذف' : 'Remove'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="p-8 text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? (
                  <>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      انقر للتحميل
                    </span>
                    {' أو اسحب وأفلت'}
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      Click to upload
                    </span>
                    {' or drag and drop'}
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {isArabic ? 'PNG، JPG، GIF، WebP حتى 5MB' : 'PNG, JPG, GIF, WebP up to 5MB'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Help Text */}
      {!error && !preview && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {isArabic 
            ? 'الصور المدعومة: JPG، PNG، GIF، WebP. الحجم الأقصى: 5 ميجابايت.'
            : 'Supported: JPG, PNG, GIF, WebP. Max size: 5MB.'}
        </p>
      )}
    </div>
  );
}
