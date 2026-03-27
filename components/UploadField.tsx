'use client';

import { useRef, useState, useCallback } from 'react';

interface UploadFieldProps {
  onUploadSuccess: (fileUrl: string, fileId: string) => void;
  onUploadError: (error: string) => void;
  onClear?: () => void;
  currentFileUrl?: string | null;
}

export default function UploadField({ onUploadSuccess, onUploadError, onClear, currentFileUrl }: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cocoModelRef = useRef<{
    detect: (img: HTMLImageElement) => Promise<Array<{ class: string; score: number; bbox: [number, number, number, number] }>>;
  } | null>(null);
  const cocoModelLoadingRef = useRef<Promise<void> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingPhoto, setIsCheckingPhoto] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkStatus, setCheckStatus] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [framingWarning, setFramingWarning] = useState<string | null>(null);
  const [hasFramingIssue, setHasFramingIssue] = useState(false);

  const loadImageFromFile = useCallback((file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Kon afbeelding niet laden'));
      };
      img.src = objectUrl;
    });
  }, []);

  const ensureCocoModel = useCallback(async () => {
    if (cocoModelRef.current) return;
    if (!cocoModelLoadingRef.current) {
      cocoModelLoadingRef.current = (async () => {
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        cocoModelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      })();
    }
    await cocoModelLoadingRef.current;
  }, []);

  const detectLikelyNotFullBody = useCallback(async (file: File): Promise<boolean> => {
    try {
      await ensureCocoModel();
      if (!cocoModelRef.current) return false;

      const image = await loadImageFromFile(file);
      const imageWidth = image.naturalWidth || image.width;
      const imageHeight = image.naturalHeight || image.height;

      const predictions = await cocoModelRef.current.detect(image);
      const persons = predictions
        .filter((prediction) => prediction.class === 'person' && prediction.score >= 0.45)
        .sort((a, b) => b.score - a.score);

      if (!persons.length) {
        // If we cannot detect a person, avoid false warnings and let manual check remain possible.
        return false;
      }

      const [x, y, w, h] = persons[0].bbox;
      const right = x + w;
      const bottom = y + h;

      const touchesTop = y <= imageHeight * 0.02;
      const touchesBottom = bottom >= imageHeight * 0.98;
      const touchesLeft = x <= imageWidth * 0.01;
      const touchesRight = right >= imageWidth * 0.99;
      const tooWide = imageWidth > imageHeight;

      // Main signal: when person box is cut by frame borders, body is likely incomplete.
      if (touchesTop || touchesBottom || touchesLeft || touchesRight || tooWide) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, [ensureCocoModel, loadImageFromFile]);

  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);
    setFramingWarning(null);
    setHasFramingIssue(false);
    setFileName(file.name);
    setIsUploading(true);
    setIsCheckingPhoto(true);
    setCheckProgress(0);
    setCheckStatus('AI controle gestart');

    const formData = new FormData();
    formData.append('file', file);

    try {
      let progressValue = 0;
      const progressTimer = window.setInterval(() => {
        progressValue = Math.min(progressValue + 7, 92);
        setCheckProgress(progressValue);
        if (progressValue < 28) setCheckStatus('Foto voorbereiden');
        else if (progressValue < 58) setCheckStatus('Persoon detecteren');
        else if (progressValue < 90) setCheckStatus('Kader controleren');
        else setCheckStatus('Controle afronden');
      }, 120);

      const likelyNotFullBody = await detectLikelyNotFullBody(file);
      window.clearInterval(progressTimer);
      setCheckProgress(100);
      setCheckStatus('Controle afgerond');
      setIsCheckingPhoto(false);

      if (likelyNotFullBody) {
        setHasFramingIssue(true);
        setFramingWarning(
          'Deze foto lijkt geen volledig zichtbare persoon te bevatten. Kies bij voorkeur een foto waarop de persoon van top tot teen in beeld staat voor een correcte uitsnede.'
        );
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        const msg = json.error ?? 'Upload mislukt. Probeer het opnieuw.';
        setUploadError(msg);
        onUploadError(msg);
        setFileName(null);
      } else {
        onUploadSuccess(json.fileUrl, json.fileId);
      }
    } catch {
      const msg = 'Upload mislukt. Controleer je verbinding en probeer opnieuw.';
      setUploadError(msg);
      onUploadError(msg);
      setFileName(null);
    } finally {
      setIsCheckingPhoto(false);
      setCheckProgress(0);
      setCheckStatus('');
      setIsUploading(false);
    }
  }, [detectLikelyNotFullBody, onUploadSuccess, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleReset = () => {
    setFileName(null);
    setUploadError(null);
    setFramingWarning(null);
    setHasFramingIssue(false);
    onClear?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {!currentFileUrl ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          aria-label="Foto uploaden"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic"
            onChange={handleChange}
            className="sr-only"
          />

          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">
                  {isCheckingPhoto ? `Foto controleren... ${checkProgress}%` : 'Uploaden...'}
                </p>
                {isCheckingPhoto && (
                  <div className="w-full max-w-xs mt-1">
                    <p className="text-xs text-gray-500 mb-1">{checkStatus}</p>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-[width] duration-150 ease-out"
                        style={{ width: `${checkProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sleep je foto hierheen
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of klik om te bladeren. JPG, PNG, HEIC tot 25 MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          {hasFramingIssue ? (
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v4m0 4h.01M10.29 3.86l-7.18 12.4A2 2 0 004.83 19h14.34a2 2 0 001.72-2.74l-7.18-12.4a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName ?? 'Foto geupload'}
            </p>
            <p className={`text-xs ${hasFramingIssue ? 'text-amber-700' : 'text-gray-500'}`}>
              {hasFramingIssue ? 'Upload gelukt - controleer foto' : 'Upload gelukt - foto voldoet aan alle voorwaarden'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-2 flex-shrink-0"
          >
            Wijzigen
          </button>
        </div>
      )}

      {uploadError && (
        <p className="mt-2 text-sm text-red-600" role="alert">{uploadError}</p>
      )}

      {framingWarning && (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
          <p className="text-sm text-amber-800">{framingWarning}</p>
        </div>
      )}
    </div>
  );
}
