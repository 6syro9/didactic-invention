'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, RefreshCw, Sparkles, Zap, UserRound, Shirt } from 'lucide-react';



import Button from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import FileInput from './components/ui/file-input';
import RadioGroup from './components/ui/radio-group';
import Slider from './components/ui/slider';
import { Dropdown } from './components/ui/dropdown';
import pica from 'pica';

// Map display names to API values
const CATEGORY_API_MAPPING: { [key: string]: string } = {
  "Auto": "auto",
  "Top": "tops",
  "Bottom": "bottoms",
  "Full-body": "one-pieces"
};

// Sample images for examples
const modelExamples = [
  '/models/model.png',

];

const garmentExamples = [
  '/clothes/cloth-1.jpg',
  '/clothes/cloth-2.jpg',
  '/clothes/cloth-3.jpg',
  '/clothes/cloth-4.jpg',
  '/clothes/cloth-5.jpg',
  '/clothes/cloth-6.jpg',
  '/clothes/cloth-7.jpg',
  '/clothes/cloth-8.jpg',
  '/clothes/cloth-9.jpg',
  '/clothes/cloth-10.jpg',
];

const MAX_IMAGE_HEIGHT = 2000;
const JPEG_QUALITY = 0.95;



export default function Home() {
  // Input states
  const [modelImageFile, setModelImageFile] = useState<File | null>(null);
  const [modelImagePreview, setModelImagePreview] = useState<string | null>(null);
  const [garmentImageFile, setGarmentImageFile] = useState<File | null>(null);
  const [garmentImagePreview, setGarmentImagePreview] = useState<string | null>(null);

  // Model settings
  const [modelVersion, setModelVersion] = useState('tryon-v1.6');
  const [garmentPhotoType, setGarmentPhotoType] = useState('Auto');
  const [category, setCategory] = useState('Auto');
  const [mode, setMode] = useState('Balanced');
  const [seed, setSeed] = useState(42);
  const [numSamples, setNumSamples] = useState(1);

  // Output states
  const [resultGallery, setResultGallery] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  


  // Example carousel states
  const [modelExampleIndex, setModelExampleIndex] = useState(0);
  const [garmentExampleIndex, setGarmentExampleIndex] = useState(0);

  // Results modal state
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  
  // API key - using a default key or environment variable
  const [apiKey] = useState<string>('demo-key-12345'); // Default demo key

  // Handle navigating results in modal
  const navigateResult = useCallback((direction: 'prev' | 'next') => {
    setCurrentResultIndex(prevIndex => {
      if (direction === 'prev' && prevIndex > 0) {
        return prevIndex - 1;
      }
      if (direction === 'next' && prevIndex < resultGallery.length - 1) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [resultGallery.length]);

  // Keyboard navigation for results modal
  useEffect(() => {
    if (!isResultsModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateResult('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateResult('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsResultsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResultsModalOpen, navigateResult]);

  // Touch/swipe handlers for model examples
  const handleModelSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && modelExampleIndex > 0) {
      setModelExampleIndex(modelExampleIndex - 1);
    } else if (direction === 'right' && modelExampleIndex < modelExamples.length - 1) {
      setModelExampleIndex(modelExampleIndex + 1);
    }
  };

  // Touch/swipe handlers for garment examples
  const handleGarmentSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && garmentExampleIndex > 0) {
      setGarmentExampleIndex(garmentExampleIndex - 1);
    } else if (direction === 'right' && garmentExampleIndex < garmentExamples.length - 1) {
      setGarmentExampleIndex(garmentExampleIndex + 1);
    }
  };

  // File input change handler
  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    setImageFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      
      // Clear validation errors when both images are available
      if (setImageFile === setModelImageFile && garmentImageFile) {
        setError(null);
      } else if (setImageFile === setGarmentImageFile && modelImageFile) {
        setError(null);
      }
    } else {
      setImageFile(null);
      setPreview(null);
    }
  };

  // Handle opening results modal
  const openResultsModal = (index: number) => {
    setCurrentResultIndex(index);
    setIsResultsModalOpen(true);
  };

  // Load example images
  const loadExampleImage = async (
    imageUrl: string,
    setImageFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      const file = new File([blob], filename, { type: blob.type });
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      
      // Clear validation errors when both images are available
      if (setImageFile === setModelImageFile && garmentImageFile) {
        setError(null);
      } else if (setImageFile === setGarmentImageFile && modelImageFile) {
        setError(null);
      }
    } catch (err) {
      console.error("Failed to load example image:", err);
      setError("Failed to load example image.");
    }
  };

  // Clear all form data
  const handleReset = () => {
    setModelImageFile(null);
    setModelImagePreview(null);
    setGarmentImageFile(null);
    setGarmentImagePreview(null);
    setResultGallery([]);
    setError(null);
    setGarmentPhotoType('Auto');
    setCategory('Auto');
    setMode('Balanced');
    setModelVersion('tryon-v1.6');
    setSeed(42);
    setNumSamples(1);
  };

  /**
   * Resize image using pica for high-quality downscaling
   * - Uses Lanczos filtering for better quality
   * - Maintains aspect ratio
   * - Returns resized File object
   */
  const resizeImagePica = async (file: File, maxDimension = MAX_IMAGE_HEIGHT): Promise<File> => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = objectUrl;

    await img.decode();
    const { width, height } = img;

    // If both dimensions are below the threshold, skip resizing
    if (width <= maxDimension && height <= maxDimension) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    // Calculate new dimensions (fit: inside)
    const aspect = width / height;
    let newWidth, newHeight;
    if (width > height) {
      newWidth = maxDimension;
      newHeight = Math.round(maxDimension / aspect);
    } else {
      newHeight = maxDimension;
      newWidth = Math.round(maxDimension * aspect);
    }

    // Source canvas
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const ctx = sourceCanvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);

    // Target canvas
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = newWidth;
    targetCanvas.height = newHeight;

    // Use pica for high-quality downscale (Lanczos)
    const picaInstance = pica();
    await picaInstance.resize(sourceCanvas, targetCanvas);

    // Convert to Blob, then to File
    const outputBlob = await picaInstance.toBlob(targetCanvas, file.type || 'image/png', JPEG_QUALITY);
    const resizedFile = new File([outputBlob], file.name, { type: outputBlob.type });

    URL.revokeObjectURL(objectUrl);
    return resizedFile;
  };

  // Convert file to base64
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!modelImageFile || !garmentImageFile) {
      setError("Please select both a model and a garment image.");
      return;
    }



    setIsLoading(true);
    setError(null);

    try {
      // Preprocess images according to FASHN API best practices
      // Base64 encoding is used for simplicity, though CDN-hosted images are recommended for production
      let modelImageBase64, garmentImageBase64;
      
      try {
        const resizedModelFile = await resizeImagePica(modelImageFile);
        const resizedGarmentFile = await resizeImagePica(garmentImageFile);
        modelImageBase64 = await fileToBase64(resizedModelFile);
        garmentImageBase64 = await fileToBase64(resizedGarmentFile);
      } catch (preprocessError) {
        console.warn('Image preprocessing failed, falling back to direct base64 conversion:', preprocessError);
        modelImageBase64 = await fileToBase64(modelImageFile);
        garmentImageBase64 = await fileToBase64(garmentImageFile);
      }

      const basePayload = {
        model_image: modelImageBase64,
        garment_image: garmentImageBase64,
        garment_photo_type: garmentPhotoType.toLowerCase(),
        category: CATEGORY_API_MAPPING[category],
        mode: mode.toLowerCase(),
        seed: seed,
        num_samples: numSamples,
        api_key: apiKey,
      };

      // Single API call
      const payload = { ...basePayload, model_name: modelVersion };

      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      setResultGallery(data.output || []);

    } catch (err: unknown) {
      console.error("Try-on error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* <Banner /> */}
        
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 rounded-lg my-4 bg-gray-50 dark:bg-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              Tips for successful try-on generations
            </h2>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsTipsModalOpen(true)}
            className="w-full sm:w-auto flex-shrink-0"
          >
            View Tips
          </Button>
          
          <TipsModal 
            isOpen={isTipsModalOpen} 
            onClose={() => setIsTipsModalOpen(false)} 
          />
        </motion.div> */}

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="mt-10 space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Model Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-gray-600" />
                  Model Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileInput 
                  onChange={(e) => handleImageChange(e, setModelImageFile, setModelImagePreview)}
                  accept="image/*"
                  label="Upload model image"
                />
                
                <AnimatePresence mode="wait">
                  {modelImagePreview ? (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <div className="aspect-[2/2.5] max-w-[280px] max-h-[350px] mx-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <Image 
                          src={modelImagePreview} 
                          alt="Model Preview" 
                          className="max-w-full max-h-full object-contain p-2" 
                          width={280}
                          height={350}
                          unoptimized
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          setModelImageFile(null);
                          setModelImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full p-1 shadow-md cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="aspect-[2/2.5] max-w-[280px] max-h-[350px] mx-auto border border-dashed border-gray-200 dark:border-gray-700 rounded-lg relative overflow-hidden bg-gray-50 dark:bg-gray-800"
                    >
                      {/* Top overlay with text */}
                      <div className="absolute top-3 left-3 right-3 z-10">
                        <div className="inline-flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-full">
                          <UserRound className="h-4 w-4" />
                          <p className="text-xs font-medium">Select a model image</p>
                        </div>
                      </div>
                      
                      {/* Main example content taking most space */}
                      {modelExamples.length > 0 ? (
                        <div className="w-full h-full relative">
                          <motion.button
                            key={modelExampleIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, info) => {
                              if (info.offset.x > 50) {
                                handleModelSwipe('left');
                              } else if (info.offset.x < -50) {
                                handleModelSwipe('right');
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              loadExampleImage(modelExamples[modelExampleIndex], setModelImageFile, setModelImagePreview);
                            }}
                            className="w-full h-full cursor-pointer group"
                          >
                            <Image 
                              src={modelExamples[modelExampleIndex]} 
                              alt={`Model Example ${modelExampleIndex + 1}`} 
                              width={280} 
                              height={350} 
                              className="w-full h-full object-contain pointer-events-none transform scale-70" 
                            />
                            
                            {/* Swipe hint overlay */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-black/80 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                                Tap to use • Swipe to browse
                              </div>
                            </div>
                          </motion.button>
                          
                          {/* Navigation controls at bottom */}
                          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleModelSwipe('left');
                              }}
                              disabled={modelExampleIndex === 0}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </motion.button>
                            
                            {/* Dots indicator */}
                            <div className="flex gap-1.5">
                              {modelExamples.map((_, idx) => (
                                <motion.div 
                                  key={idx} 
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === modelExampleIndex ? 'bg-white scale-125' : 'bg-white/50'
                                  }`}
                                  whileHover={{ scale: 1.2 }}
                                />
                              ))}
                            </div>
                            
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleModelSwipe('right');
                              }}
                              disabled={modelExampleIndex === modelExamples.length - 1}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <UserRound className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No examples available
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </CardContent>
            </Card>

            {/* Column 2: Garment Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-gray-600" />
                  Garment Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileInput 
                  onChange={(e) => handleImageChange(e, setGarmentImageFile, setGarmentImagePreview)}
                  accept="image/*"
                  label="Upload garment image"
                />
                
                <AnimatePresence mode="wait">
                  {garmentImagePreview ? (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <div className="aspect-[2/2.5] max-w-[280px] max-h-[350px] mx-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <Image 
                          src={garmentImagePreview} 
                          alt="Garment Preview" 
                          className="max-w-full max-h-full object-contain p-2" 
                          width={280}
                          height={350}
                          unoptimized
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          setGarmentImageFile(null);
                          setGarmentImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full p-1 shadow-md cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="aspect-[2/2.5] max-w-[280px] max-h-[350px] mx-auto border border-dashed border-gray-200 dark:border-gray-700 rounded-lg relative overflow-hidden bg-gray-50 dark:bg-gray-800"
                    >
                      {/* Top overlay with text */}
                      <div className="absolute top-3 left-3 right-3 z-10">
                        <div className="inline-flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-full">
                          <Shirt className="h-4 w-4" />
                          <p className="text-xs font-medium">Select a garment image</p>
                        </div>
                      </div>
                      
                      {/* Main example content taking most space */}
                      {garmentExamples.length > 0 ? (
                        <div className="w-full h-full relative">
                          <motion.button
                            key={garmentExampleIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, info) => {
                              if (info.offset.x > 50) {
                                handleGarmentSwipe('left');
                              } else if (info.offset.x < -50) {
                                handleGarmentSwipe('right');
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              loadExampleImage(garmentExamples[garmentExampleIndex], setGarmentImageFile, setGarmentImagePreview);
                            }}
                            className="w-full h-full cursor-pointer group"
                          >
                            <Image 
                              src={garmentExamples[garmentExampleIndex]} 
                              alt={`Garment Example ${garmentExampleIndex + 1}`} 
                              width={280} 
                              height={350} 
                              className="w-full h-full object-contain pointer-events-none transform scale-70" 
                            />
                            
                            {/* Swipe hint overlay */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-black/80 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                                Tap to use • Swipe to browse
                              </div>
                            </div>
                          </motion.button>
                          
                          {/* Navigation controls at bottom */}
                          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGarmentSwipe('left');
                              }}
                              disabled={garmentExampleIndex === 0}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </motion.button>
                            
                            {/* Dots indicator */}
                            <div className="flex gap-1.5">
                              {garmentExamples.map((_, idx) => (
                                <motion.div 
                                  key={idx} 
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === garmentExampleIndex ? 'bg-white scale-125' : 'bg-white/50'
                                  }`}
                                  whileHover={{ scale: 1.2 }}
                                />
                              ))}
                            </div>
                            
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGarmentSwipe('right');
                              }}
                              disabled={garmentExampleIndex === garmentExamples.length - 1}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center disabled:opacity-30 text-white cursor-pointer disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Shirt className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No examples available
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <Dropdown
                  label="Garment Settings"
                  className="mt-2"
                >
                  <div className="space-y-4">
                    <RadioGroup
                      label="Photo Type"
                      name="garmentPhotoType"
                      options={[
                        { label: "Auto", value: "Auto" },
                        { label: "Flat-Lay", value: "Flat-Lay" },
                        { label: "Model", value: "Model" }
                      ]}
                      value={garmentPhotoType}
                      onChange={setGarmentPhotoType}
                      variant="card"
                      layout="vertical"
                    />
                    
                    <RadioGroup
                      label="Category"
                      name="category"
                      options={[
                        { label: "Auto", value: "Auto" },
                        { label: "Top", value: "Top" },
                        { label: "Bottom", value: "Bottom" },
                        { label: "Full-body", value: "Full-body" }
                      ]}
                      value={category}
                      onChange={setCategory}
                    />
                  </div>
                </Dropdown>
              </CardContent>
            </Card>

            {/* Column 3: Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">

                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !modelImageFile || !garmentImageFile}
                    loading={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Generating...' : 'Run Try-On'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="px-3"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                <RadioGroup
                  label="Run Mode"
                  name="mode"
                  options={[
                    { label: "Performance", value: "Performance" },
                    { label: "Balanced", value: "Balanced" },
                    { label: "Quality", value: "Quality" }
                  ]}
                  value={mode}
                  onChange={setMode}
                  variant="card"
                  layout="horizontal"
                />
                
                <div className="space-y-4 px-2">
                  <Slider
                    min={1}
                    max={4}
                    step={1}
                    value={numSamples}
                    onChange={setNumSamples}
                    label="Number of Samples"
                  />
                  
                  <div className="relative">
                    <label htmlFor="seed" className="block text-sm font-medium mb-1">
                      Seed
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="seed"
                        min={0}
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm font-medium transition-colors cursor-pointer"
                        title="Generate random seed"
                      >
                        🎲
                      </motion.button>
                    </div>
                  </div>
                  
                  <RadioGroup
                    label="Model Version"
                    name="modelVersion"
                    options={[
                      { label: "v1.6", value: "tryon-v1.6" },
                      { label: "v1.5", value: "tryon-v1.5" },
                      { label: "Staging", value: "tryon-staging" }
                    ]}
                    value={modelVersion}
                    onChange={setModelVersion}
                    variant="card"
                    layout="vertical"
                  />
                  
                </div>
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm rounded-md border border-gray-300 dark:border-gray-600"
                  >
                    <div className="flex items-start gap-2">
                      <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.form>

        {/* Try-On Results Section */}
        <AnimatePresence mode="wait">
          {(isLoading || resultGallery.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-gray-600" />
                      Try-On Results
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                      >
                        <div className="relative">
                          <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 animate-spin" />
                          <Sparkles className="h-6 w-6 text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">
                          Generating your virtual try-on...
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      >
                        {resultGallery.map((url, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                              transition: { delay: index * 0.05, duration: 0.2 }
                            }}
                            className="relative group cursor-pointer"
                            onClick={() => openResultsModal(index)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openResultsModal(index);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`View result ${index + 1} in full screen`}
                          >
                            <div className="aspect-[2/3] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                              <Image 
                                src={url} 
                                alt={`Result ${index + 1}`} 
                                className="max-w-full max-h-full object-contain p-2" 
                                width={300}
                                height={400}
                                unoptimized
                              />
                            </div>
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-black/70 text-white py-2 px-4 rounded-full text-sm flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Click to view full size
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-screen Results Modal */}
        <AnimatePresence>
          {isResultsModalOpen && resultGallery.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 w-screen h-screen bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh'
              }}
              onClick={() => setIsResultsModalOpen(false)}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsResultsModalOpen(false)}
                  className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </motion.button>

                {/* Image counter */}
                <div className="absolute top-4 left-4 z-10 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span>{currentResultIndex + 1} of {resultGallery.length}</span>
                    {resultGallery.length > 1 && (
                      <span className="text-xs opacity-75">• Use ← → keys</span>
                    )}
                  </div>
                </div>

                {/* Previous button */}
                {currentResultIndex > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateResult('prev');
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                )}

                {/* Next button */}
                {currentResultIndex < resultGallery.length - 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateResult('next');
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                )}

                {/* Main image */}
                <motion.div
                  key={currentResultIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="w-full h-full flex items-center justify-center p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={resultGallery[currentResultIndex]}
                    alt={`Result ${currentResultIndex + 1}`}
                    className="w-auto h-auto max-w-[min(400px,calc(100vw-2rem))] max-h-[min(533px,calc(100vh-2rem))] object-contain"
                    width={1200}
                    height={1600}
                    unoptimized
                  />
                </motion.div>

                {/* Download button */}
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={resultGallery[currentResultIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="absolute bottom-4 right-4 z-10 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm transition-colors cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginRight: '1rem' }}
                >
                  <Zap className="h-4 w-4" />
                  Download
                </motion.a>

                {/* Dots indicator for multiple results */}
                {resultGallery.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
                    {resultGallery.map((_, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentResultIndex(idx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentResultIndex ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Modal */}
        <AnimatePresence>
          {/* Removed comparison modal as it's no longer used */}
        </AnimatePresence>



        {/* <Footer /> */}
      </div>
    </div>
  );
}