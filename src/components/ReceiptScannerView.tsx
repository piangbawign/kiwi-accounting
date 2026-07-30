import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import {
  Scan,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Receipt,
  QrCode,
  Camera,
  CameraOff,
  CookingPot,
  BookMarked,
  Search,
  Trash2,
  ExternalLink,
  ChevronRight,
  Utensils,
  Landmark,
  X,
  Copy,
  Tag,
  DollarSign,
  Info,
} from 'lucide-react';
import { Account, Transaction, ScannedQrRecipeReceipt } from '../types';

interface ReceiptScannerViewProps {
  accounts: Account[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  scannedQrItems?: ScannedQrRecipeReceipt[];
  onSaveScannedItem?: (item: ScannedQrRecipeReceipt) => void;
  onDeleteScannedItem?: (id: string) => void;
}

export const ReceiptScannerView: React.FC<ReceiptScannerViewProps> = ({
  accounts,
  onAddTransaction,
  scannedQrItems = [],
  onSaveScannedItem,
  onDeleteScannedItem,
}) => {
  const [activeTab, setActiveTab] = useState<'QR_SCANNER' | 'AI_PHOTO_SCANNER' | 'SAVED_LIBRARY'>('QR_SCANNER');

  // --- QR CODE SCANNER STATE ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [qrScanError, setQrScanError] = useState('');
  const [qrDecodedData, setQrDecodedData] = useState<string | null>(null);
  const [parsedQrItem, setParsedQrItem] = useState<Partial<ScannedQrRecipeReceipt> | null>(null);
  const [qrImagePreview, setQrImagePreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // --- AI PHOTO SCANNER STATE ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [photoScanError, setPhotoScanError] = useState('');
  const [photoScanResult, setPhotoScanResult] = useState<any>(null);

  // --- COMMON SAVING STATE ---
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // --- LIBRARY FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'RECEIPT' | 'RECIPE' | 'BOOKMARKS'>('ALL');
  const [selectedItemDetail, setSelectedItemDetail] = useState<ScannedQrRecipeReceipt | null>(null);

  // Clean up video stream on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Camera Start / Stop
  const startCamera = async () => {
    setQrScanError('');
    setQrDecodedData(null);
    setParsedQrItem(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickQrScan);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setQrScanError(err?.message || 'Unable to access camera for live QR code scanning.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Continuous Frame QR Scan Tick
  const tickQrScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleQrCodeFound(code.data);
          stopCamera();
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickQrScan);
  };

  // Handle QR Code Image Upload
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrScanError('');
    setQrDecodedData(null);
    setParsedQrItem(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        setQrImagePreview(event.target?.result as string);

        if (code && code.data) {
          handleQrCodeFound(code.data);
        } else {
          setQrScanError('No valid QR code detected in the uploaded image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Parse QR Code payload into structured Recipe or Receipt
  const handleQrCodeFound = (rawData: string) => {
    setQrDecodedData(rawData);

    // Smart detect if rawData is Recipe vs Receipt vs General URL/JSON
    let detectedType: 'RECEIPT' | 'RECIPE' | 'QR_CODE' = 'QR_CODE';
    let title = 'Scanned QR Item';
    let sourceOrMerchant = 'QR Scan Source';
    let totalAmount: number | undefined = undefined;
    let gstAmount: number | undefined = undefined;
    let category = 'General Scanned QR';
    let ingredientsOrItems: string[] = [];
    let instructionsOrNotes = rawData;

    const lower = rawData.toLowerCase();

    // Check JSON payload
    if (rawData.startsWith('{') && rawData.endsWith('}')) {
      try {
        const json = JSON.parse(rawData);
        if (json.recipe || json.ingredients || lower.includes('recipe')) {
          detectedType = 'RECIPE';
          title = json.recipeName || json.title || 'QR Recipe';
          sourceOrMerchant = json.source || json.author || 'Recipe QR';
          category = 'Food & Recipes';
          if (Array.isArray(json.ingredients)) ingredientsOrItems = json.ingredients;
          instructionsOrNotes = json.instructions || json.notes || rawData;
        } else {
          detectedType = 'RECEIPT';
          title = json.merchant || json.title || 'QR Receipt';
          sourceOrMerchant = json.merchant || 'GST Vendor';
          totalAmount = typeof json.total === 'number' ? json.total : parseFloat(json.total || '0') || undefined;
          gstAmount = typeof json.gst === 'number' ? json.gst : parseFloat(json.gst || '0') || (totalAmount ? totalAmount * 0.13043478 : undefined);
          category = json.category || 'General Expense';
          if (Array.isArray(json.items)) ingredientsOrItems = json.items;
          instructionsOrNotes = json.notes || `Scanned e-Receipt JSON code: ${rawData}`;
        }
      } catch (e) {
        // Fallback to text parsing
      }
    }

    if (detectedType === 'QR_CODE') {
      if (lower.includes('recipe') || lower.includes('ingredient') || lower.includes('cook') || lower.includes('bake') || lower.includes('pavlova') || lower.includes('kitchen')) {
        detectedType = 'RECIPE';
        title = 'Scanned Culinary Recipe';
        sourceOrMerchant = rawData.startsWith('http') ? new URL(rawData).hostname : 'QR Recipe Source';
        category = 'Food & Recipes';
        instructionsOrNotes = `Recipe Link / Payload: ${rawData}`;
      } else if (lower.includes('gst') || lower.includes('inv') || lower.includes('total') || lower.includes('receipt') || lower.includes('nzd') || lower.includes('tax')) {
        detectedType = 'RECEIPT';
        title = 'Scanned e-Receipt Expense';
        sourceOrMerchant = 'Scanned Merchant QR';
        category = 'Office & Operating Expense';
        // Try parsing numerical total
        const matchTotal = rawData.match(/(\$|total|nzd)?\s*([0-9]+(\.[0-9]{2})?)/i);
        if (matchTotal && matchTotal[2]) {
          totalAmount = parseFloat(matchTotal[2]);
          gstAmount = totalAmount * 0.13043478;
        }
      } else if (rawData.startsWith('http')) {
        title = 'Web Link QR';
        sourceOrMerchant = new URL(rawData).hostname;
        instructionsOrNotes = rawData;
      }
    }

    setParsedQrItem({
      id: `qr-${Date.now()}`,
      type: detectedType,
      title,
      sourceOrMerchant,
      date: new Date().toISOString().split('T')[0],
      totalAmount,
      gstAmount,
      category,
      qrRawContent: rawData,
      ingredientsOrItems,
      instructionsOrNotes,
      savedAt: new Date().toISOString(),
      isBookmarked: false,
    });
  };

  // Save parsed QR item to library
  const handleSaveParsedQr = () => {
    if (!parsedQrItem) return;
    const finalItem: ScannedQrRecipeReceipt = {
      id: parsedQrItem.id || `qr-${Date.now()}`,
      type: parsedQrItem.type || 'QR_CODE',
      title: parsedQrItem.title || 'Scanned QR Item',
      sourceOrMerchant: parsedQrItem.sourceOrMerchant || 'Scanned Source',
      date: parsedQrItem.date || new Date().toISOString().split('T')[0],
      totalAmount: parsedQrItem.totalAmount,
      gstAmount: parsedQrItem.gstAmount,
      category: parsedQrItem.category || 'General',
      qrRawContent: parsedQrItem.qrRawContent,
      ingredientsOrItems: parsedQrItem.ingredientsOrItems || [],
      instructionsOrNotes: parsedQrItem.instructionsOrNotes || '',
      savedAt: new Date().toISOString(),
      isBookmarked: false,
    };

    if (onSaveScannedItem) {
      onSaveScannedItem(finalItem);
    }
    setSaveSuccessMsg(`Saved "${finalItem.title}" to your Recipes & Receipts Library!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
    setParsedQrItem(null);
    setQrDecodedData(null);
    setQrImagePreview(null);
  };

  // Directly post parsed receipt as Expense to Bookkeeping Ledger
  const handlePostReceiptToLedger = (item: Partial<ScannedQrRecipeReceipt>) => {
    if (!targetAccountId) return;
    const amount = item.totalAmount || 0;
    onAddTransaction({
      date: item.date || new Date().toISOString().split('T')[0],
      description: item.title || item.sourceOrMerchant || 'Scanned Receipt Expense',
      amount,
      type: 'EXPENSE',
      category: item.category || 'General Expenses',
      accountId: targetAccountId,
      gstType: item.gstAmount ? 'STANDARD_15' : 'NO_GST',
      gstAmount: item.gstAmount || amount * 0.13043478,
      irdTaxCode: '300 - General Expenses',
      notes: `Scanned QR / Receipt. ${item.instructionsOrNotes || ''}`,
      isReconciled: false,
    });

    setSaveSuccessMsg(`Successfully posted $${amount.toFixed(2)} NZD expense into your NZ Bookkeeping Ledger!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // --- AI PHOTO SCANNER HANDLERS ---
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPhotoScanResult(null);
    setPhotoScanError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            setPreviewUrl(result);
          }
        };
        img.onerror = () => setPreviewUrl(result);
        img.src = result;
      } else {
        setPreviewUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiPhotoScan = async () => {
    if (!previewUrl) return;

    setIsScanningPhoto(true);
    setPhotoScanError('');
    setPhotoScanResult(null);

    try {
      const actualMimeType = previewUrl.split(';')[0].split(':')[1] || 'image/jpeg';
      const cleanBase64Payload = previewUrl.includes(',') ? previewUrl.split(',')[1].replace(/\s+/g, '') : previewUrl.replace(/\s+/g, '');
      
      const aiApiKey = localStorage.getItem('kiwi_ai_api_key');
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: cleanBase64Payload,
          mimeType: actualMimeType,
          apiKey: aiApiKey || undefined,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to scan image with AI.');
      }

      setPhotoScanResult(data.result);
    } catch (err: any) {
      console.error('Scan photo error:', err);
      setPhotoScanError(err?.message || 'Error parsing photo with AI.');
    } finally {
      setIsScanningPhoto(false);
    }
  };

  // Filtered Library Items
  const filteredLibrary = scannedQrItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceOrMerchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.instructionsOrNotes && item.instructionsOrNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'RECEIPT') return item.type === 'RECEIPT';
    if (filterType === 'RECIPE') return item.type === 'RECIPE';
    if (filterType === 'BOOKMARKS') return item.isBookmarked;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                Recipe & Receipt QR Scanner
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant camera QR scanning, recipe extraction, and IRD expense receipt logging
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('QR_SCANNER');
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'QR_SCANNER'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code Live</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('AI_PHOTO_SCANNER');
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'AI_PHOTO_SCANNER'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Photo OCR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('SAVED_LIBRARY');
            }}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'SAVED_LIBRARY'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
            <span>Saved Library ({scannedQrItems.length})</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* --- TAB 1: QR CODE LIVE & IMAGE SCANNER --- */}
      {activeTab === 'QR_SCANNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Live Camera & Upload QR */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Live Camera QR Code Scanner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Point your camera at any QR code on a recipe card, e-receipt, menu, or invoice.
              </p>
            </div>

            {/* Video Feed or Start Button */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isCameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-teal-400">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Camera preview inactive</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto"
                  >
                    <Camera className="w-4 h-4" /> Start Live QR Scanner
                  </button>
                </div>
              )}

              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-teal-400 border-dashed rounded-2xl animate-pulse flex items-center justify-center">
                    <span className="text-[10px] font-bold text-teal-300 bg-slate-950/80 px-2 py-0.5 rounded-full">
                      Scanning for QR Code...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isCameraActive && (
              <button
                type="button"
                onClick={stopCamera}
                className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <CameraOff className="w-4 h-4" /> Stop Live Camera
              </button>
            )}

            {/* Or Upload Image QR */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Or Upload an Image with a QR Code
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-4 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-semibold">Choose photo or screenshot</span>
                </div>
              </div>
            </div>

            {qrScanError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{qrScanError}</span>
              </div>
            )}
          </div>

          {/* Right Column: Decoded QR Data & Saved Action */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Scan className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Decoded QR Result & Structure
            </h2>

            {!parsedQrItem ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <QrCode className="w-10 h-10 mx-auto mb-2 opacity-30 text-teal-600" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Scan or upload a QR code</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Decoded information will be classified automatically as Recipe, Expense Receipt, or Web QR.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Type Selection Pill */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Item Type:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setParsedQrItem({ ...parsedQrItem, type: 'RECIPE', category: 'Food & Recipes' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        parsedQrItem.type === 'RECIPE'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CookingPot className="w-3.5 h-3.5" /> Recipe
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedQrItem({ ...parsedQrItem, type: 'RECEIPT', category: 'Operating Expense' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        parsedQrItem.type === 'RECEIPT'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" /> Expense Receipt
                    </button>
                  </div>
                </div>

                {/* Form Fields to Edit */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Title / Name
                    </label>
                    <input
                      type="text"
                      value={parsedQrItem.title || ''}
                      onChange={(e) => setParsedQrItem({ ...parsedQrItem, title: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Source / Merchant
                      </label>
                      <input
                        type="text"
                        value={parsedQrItem.sourceOrMerchant || ''}
                        onChange={(e) => setParsedQrItem({ ...parsedQrItem, sourceOrMerchant: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={parsedQrItem.category || ''}
                        onChange={(e) => setParsedQrItem({ ...parsedQrItem, category: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                      />
                    </div>
                  </div>

                  {parsedQrItem.type === 'RECEIPT' && (
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900">
                      <div>
                        <label className="block text-[10px] font-bold text-teal-800 dark:text-teal-300 mb-0.5">
                          Total Amount ($ NZD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={parsedQrItem.totalAmount || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setParsedQrItem({
                              ...parsedQrItem,
                              totalAmount: val,
                              gstAmount: val * 0.13043478,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 rounded-lg font-mono font-bold text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-teal-800 dark:text-teal-300 mb-0.5">
                          GST Portion ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={parsedQrItem.gstAmount ? parsedQrItem.gstAmount.toFixed(2) : ''}
                          onChange={(e) => setParsedQrItem({ ...parsedQrItem, gstAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 rounded-lg font-mono font-bold text-teal-700 dark:text-teal-300"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Instructions / Details / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={parsedQrItem.instructionsOrNotes || ''}
                      onChange={(e) => setParsedQrItem({ ...parsedQrItem, instructionsOrNotes: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-normal leading-relaxed"
                    />
                  </div>
                </div>

                {/* Save and Ledger Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveParsedQr}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <BookMarked className="w-4 h-4" /> Save to Recipes & Receipts Library
                  </button>

                  {parsedQrItem.type === 'RECEIPT' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Select Account to Post Bookkeeping Entry
                      </label>
                      <select
                        value={targetAccountId}
                        onChange={(e) => setTargetAccountId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.bankName} - {acc.name} (${acc.balance.toFixed(2)})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handlePostReceiptToLedger(parsedQrItem)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Post directly into KiwiLedger Expense Log
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* --- TAB 2: AI PHOTO OCR SCANNER --- */}
      {activeTab === 'AI_PHOTO_SCANNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Gemini 3.6 Flash AI Receipt & Recipe Scanner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload a photo of a paper receipt or printed recipe card to extract vendor, totals, ingredients, and instructions.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/40 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-60 mx-auto rounded-xl shadow border border-slate-200 dark:border-slate-700 object-contain"
                  />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-2 py-6">
                  <Receipt className="w-10 h-10 text-teal-600 mx-auto opacity-80" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click or Drag & Drop Receipt or Recipe Photo
                  </p>
                  <p className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP files</p>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!previewUrl || isScanningPhoto}
              onClick={handleRunAiPhotoScan}
              className={`w-full py-3 px-4 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                !previewUrl || isScanningPhoto
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:from-teal-400 hover:to-emerald-400 active:scale-95'
              }`}
            >
              {isScanningPhoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Extracting details with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run AI Photo OCR Scanner
                </>
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Extracted AI Results
            </h2>

            {photoScanError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> {photoScanError}
              </div>
            )}

            {!photoScanResult ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-500" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload a receipt or recipe card photo</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Gemini AI will extract text, vendor/dish name, total cost, and line items.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Merchant / Dish Name:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{photoScanResult.merchant}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Date:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{photoScanResult.date}</span>
                  </div>

                  {photoScanResult.totalAmount > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-teal-200 dark:border-teal-900">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Total Amount:</span>
                      <span className="text-base font-black text-slate-900 dark:text-slate-100">
                        ${photoScanResult.totalAmount?.toFixed(2)} NZD
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSaveScannedItem) {
                        onSaveScannedItem({
                          id: `ai-${Date.now()}`,
                          type: photoScanResult.totalAmount > 0 ? 'RECEIPT' : 'RECIPE',
                          title: photoScanResult.merchant || 'AI Scanned Item',
                          sourceOrMerchant: photoScanResult.merchant || 'AI OCR',
                          date: photoScanResult.date || new Date().toISOString().split('T')[0],
                          totalAmount: photoScanResult.totalAmount,
                          gstAmount: photoScanResult.gstAmount,
                          category: photoScanResult.category || 'General',
                          instructionsOrNotes: photoScanResult.notes,
                          savedAt: new Date().toISOString(),
                        });
                        setSaveSuccessMsg(`Saved "${photoScanResult.merchant}" to library!`);
                        setTimeout(() => setSaveSuccessMsg(''), 3000);
                      }
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookMarked className="w-4 h-4" /> Save to Library
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: SAVED RECIPES & RECEIPTS LIBRARY --- */}
      {activeTab === 'SAVED_LIBRARY' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search recipes, receipts, ingredients, merchants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({scannedQrItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('RECIPE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === 'RECIPE'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CookingPot className="w-3.5 h-3.5" /> Recipes
              </button>
              <button
                type="button"
                onClick={() => setFilterType('RECEIPT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === 'RECEIPT'
                    ? 'bg-teal-600 text-white font-extrabold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" /> Expense Receipts
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredLibrary.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
              <Utensils className="w-10 h-10 mx-auto opacity-30 text-teal-600" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No saved items found</p>
              <p className="text-[11px] text-slate-400">Scan a QR code or upload a photo to save your first recipe or receipt!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLibrary.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 ${
                          item.type === 'RECIPE'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                            : 'bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300'
                        }`}
                      >
                        {item.type === 'RECIPE' ? <CookingPot className="w-3 h-3" /> : <Receipt className="w-3 h-3" />}
                        {item.type}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSaveScannedItem) {
                              onSaveScannedItem({ ...item, isBookmarked: !item.isBookmarked });
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isBookmarked
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Bookmark item"
                        >
                          <BookMarked className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onDeleteScannedItem) onDeleteScannedItem(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.title}
                    </h3>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{item.sourceOrMerchant}</span>
                      <span className="font-mono">{item.date}</span>
                    </div>

                    {item.totalAmount !== undefined && (
                      <div className="p-2 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 flex justify-between items-center text-xs">
                        <span className="font-bold text-teal-800 dark:text-teal-300">Total NZD:</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">${item.totalAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {item.ingredientsOrItems && item.ingredientsOrItems.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.type === 'RECIPE' ? 'Ingredients' : 'Items'} ({item.ingredientsOrItems.length})
                        </span>
                        <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 max-h-28 overflow-y-auto">
                          {item.ingredientsOrItems.slice(0, 4).map((ing, i) => (
                            <li key={i} className="truncate flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                              <span className="truncate">{ing}</span>
                            </li>
                          ))}
                          {item.ingredientsOrItems.length > 4 && (
                            <li className="text-[10px] text-slate-400 italic">
                              + {item.ingredientsOrItems.length - 4} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItemDetail(item)}
                      className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {item.type === 'RECEIPT' && item.totalAmount && (
                      <button
                        type="button"
                        onClick={() => handlePostReceiptToLedger(item)}
                        className="py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                        title="Post as expense to ledger"
                      >
                        <Plus className="w-3.5 h-3.5" /> Post
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* --- ITEM DETAIL MODAL --- */}
      {selectedItemDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 uppercase tracking-wider">
                  {selectedItemDetail.type} Detail
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                  {selectedItemDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Source: {selectedItemDetail.sourceOrMerchant}</span>
                <span>Date: {selectedItemDetail.date}</span>
              </div>

              {selectedItemDetail.totalAmount !== undefined && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 flex justify-between items-center font-bold">
                  <span>Total Cost:</span>
                  <span className="text-base font-black">${selectedItemDetail.totalAmount.toFixed(2)} NZD</span>
                </div>
              )}

              {selectedItemDetail.ingredientsOrItems && selectedItemDetail.ingredientsOrItems.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                    {selectedItemDetail.type === 'RECIPE' ? 'Ingredients' : 'Line Items'}:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {selectedItemDetail.ingredientsOrItems.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItemDetail.instructionsOrNotes && (
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                    {selectedItemDetail.type === 'RECIPE' ? 'Instructions & Method' : 'Notes & Metadata'}:
                  </h4>
                  <p className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedItemDetail.instructionsOrNotes}
                  </p>
                </div>
              )}

              {selectedItemDetail.qrRawContent && (
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-1 text-[10px] uppercase text-slate-400">
                    Raw QR Code Data
                  </h4>
                  <div className="p-2 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl truncate">
                    {selectedItemDetail.qrRawContent}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
