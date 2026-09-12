import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Check, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  FileText,
  Send,
  Loader2,
  X,
  ShieldCheck,
  Lock,
  Info,
  Layers,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { ReportType, Report, ImageAnalysisResult } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  CATEGORY_DATA, 
  CAMPUS_LOCATIONS, 
  getQuestionsForItem, 
  getModelsForBrand,
  DynamicQuestion 
} from '../data/itemQuestionSchemas';

interface ReportingFlowProps {
  type: ReportType; // 'LOST' | 'FOUND'
  onCancel: () => void;
  onSuccess: (newReport: Report) => void;
}

function getOptionValue(opt: string | { value: string; label: string }): string {
  return typeof opt === 'string' ? opt : opt.value;
}

function getOptionLabel(opt: string | { value: string; label: string }): string {
  return typeof opt === 'string' ? opt : opt.label;
}

export const ReportingFlow: React.FC<ReportingFlowProps> = ({
  type,
  onCancel,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Natural Language Assist Bar State
  const [nlInput, setNlInput] = useState('');
  const [isNlParsing, setIsNlParsing] = useState(false);
  const [nlSuccessMsg, setNlSuccessMsg] = useState<string | null>(null);
  const [conversationalReply, setConversationalReply] = useState<string | null>(null);
  const [detectedFields, setDetectedFields] = useState<Set<string>>(new Set());

  // Core Category & Item Type Selection
  const [category, setCategory] = useState<string>('Electronics');
  const [itemType, setItemType] = useState<string>('Phone');

  // Dynamic Item-Specific Answers Store
  const [answers, setAnswers] = useState<Record<string, any>>({
    brand: 'Apple',
    model: 'iPhone 13',
    colour: 'Black',
    hasCase: 'Yes',
    caseColour: 'Midnight / Navy Blue',
    caseDesign: 'Plain matte texture',
    lockType: '6-digit PIN',
  });

  // Location & Time Frame (Universal)
  const [location, setLocation] = useState<string>('Central Canteen / Cafeteria');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [dateLostFound, setDateLostFound] = useState<string>('Today');
  const [approxTime, setApproxTime] = useState<string>('Around 1:30 PM (Lunch period)');

  // Safe unique identifying details & private verification secret
  const [safeUniqueDetails, setSafeUniqueDetails] = useState<string>('Small scratch on bottom edge');
  const [privateVerificationSecret, setPrivateVerificationSecret] = useState<string>('Lockscreen has a family photo or specific sticker inside');

  // Theft / Suspicious flag
  const [isTheftSuspicious, setIsTheftSuspicious] = useState<boolean>(false);
  const [theftNotes, setTheftNotes] = useState<string>('');

  // Image Upload & AI Analysis
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);

  // Step Mode: 'QUESTIONS' | 'SUMMARY'
  const [step, setStep] = useState<'QUESTIONS' | 'SUMMARY'>('QUESTIONS');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Retrieve current questions for selected item
  const currentQuestions = useMemo(() => {
    return getQuestionsForItem(category, itemType);
  }, [category, itemType]);

  // Update a single answer
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: value };

      // If brand changed and item has dynamic models, update model accordingly
      if (questionId === 'brand') {
        const availableModels = getModelsForBrand(itemType, value);
        if (availableModels.length > 0 && !availableModels.includes(next.model)) {
          next.model = availableModels[0];
        }
      }

      return next;
    });
  };

  // Toggle checkbox in checkbox-group
  const handleCheckboxToggle = (questionId: string, option: string) => {
    setAnswers(prev => {
      const currentList: string[] = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const updated = currentList.includes(option)
        ? currentList.filter(item => item !== option)
        : [...currentList, option];
      return { ...prev, [questionId]: updated };
    });
  };

  // Switch category
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const firstItem = CATEGORY_DATA[newCat]?.[0] || 'Other';
    setItemType(firstItem);
    resetDefaultsForItem(newCat, firstItem);
  };

  // Switch item type
  const handleItemTypeChange = (newItem: string) => {
    setItemType(newItem);
    resetDefaultsForItem(category, newItem);
  };

  // Setup smart initial values for a newly selected item type
  const resetDefaultsForItem = (cat: string, item: string) => {
    const questions = getQuestionsForItem(cat, item);
    const newAnswers: Record<string, any> = {};

    for (const q of questions) {
      if (answers[q.id] !== undefined) {
        // preserve if already answered
        newAnswers[q.id] = answers[q.id];
      } else if (q.options && q.options.length > 0) {
        newAnswers[q.id] = q.options[0];
      } else if (q.type === 'checkbox-group') {
        newAnswers[q.id] = [];
      } else {
        newAnswers[q.id] = '';
      }
    }

    // Smart context defaults
    if (item === 'Phone' || item === 'Mobile Phone') {
      newAnswers.brand = newAnswers.brand || 'Apple';
      newAnswers.model = newAnswers.model || 'iPhone 13';
      newAnswers.colour = newAnswers.colour || 'Black';
    } else if (item === 'Laptop' || item === 'MacBook') {
      newAnswers.brand = newAnswers.brand || 'HP';
      newAnswers.model = newAnswers.model || 'Pavilion 15';
      newAnswers.colour = newAnswers.colour || 'Silver / Grey';
    } else if (item === 'College ID Card' || item === 'Student ID') {
      newAnswers.institutionName = newAnswers.institutionName || 'Engineering & Technology Campus';
      newAnswers.idType = newAnswers.idType || 'Student';
      newAnswers.idCardColour = newAnswers.idCardColour || 'White Card with Blue Lanyard';
      newAnswers.department = user?.department || 'CSE';
      if (user?.fullName) {
        newAnswers.studentName = user.fullName;
      }
    } else if (item === 'Keys') {
      newAnswers.keyType = newAnswers.keyType || 'Two-Wheeler / Bike Ignition Key (Yamaha, Honda, Royal Enfield, etc.)';
      newAnswers.keyCount = newAnswers.keyCount || 'Single key';
      newAnswers.hasKeychain = newAnswers.hasKeychain || 'Yes';
    } else if (item === 'Wallet') {
      newAnswers.walletType = newAnswers.walletType || 'Bi-fold Pocket Wallet';
      newAnswers.colour = newAnswers.colour || 'Black';
      newAnswers.material = newAnswers.material || 'Genuine Leather (Textured / Grain)';
    }

    setAnswers(newAnswers);
  };

  // Handle Natural Language Extraction (English / Tamil / Tanglish)
  const handleNlExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlInput.trim()) return;
    setIsNlParsing(true);
    setNlSuccessMsg(null);
    setConversationalReply(null);

    try {
      const extracted = await api.parseNaturalLanguage(nlInput);
      const newDetected = new Set<string>();

      // 1. Category & Item Type
      if (extracted.category && CATEGORY_DATA[extracted.category]) {
        setCategory(extracted.category);
        newDetected.add('category');
      }

      if (extracted.itemType) {
        // Map common synonyms to schema item types
        let mappedItem = extracted.itemType;
        if (mappedItem === 'Mobile Phone') mappedItem = 'Phone';
        if (mappedItem === 'MacBook') mappedItem = 'Laptop';
        if (mappedItem === 'Student ID' || mappedItem === 'ID Card') mappedItem = 'College ID Card';
        if (mappedItem === 'Backpack') mappedItem = 'Bag';
        if (mappedItem === 'Smartwatch') mappedItem = 'Smart Watch';
        if (mappedItem === 'Earbuds') mappedItem = 'Earbuds / Headphones';

        setItemType(mappedItem);
        newDetected.add('itemType');
      }

      // 2. Populate item dynamic attributes
      setAnswers(prev => {
        const next = { ...prev };

        if (extracted.brand && extracted.brand !== 'Unknown') {
          next.brand = extracted.brand;
          newDetected.add('brand');
        }
        if (extracted.model && extracted.model !== 'Unknown') {
          next.model = extracted.model;
          newDetected.add('model');
        }
        if (extracted.colour && extracted.colour !== 'Unknown') {
          next.colour = extracted.colour;
          next.idCardColour = extracted.colour;
          newDetected.add('colour');
        }
        if (extracted.hasCase !== undefined) {
          next.hasCase = extracted.hasCase ? 'Yes' : 'No';
          newDetected.add('hasCase');
        }
        if (extracted.caseColour && extracted.caseColour !== 'Unknown') {
          next.caseColour = extracted.caseColour;
          next.hasCase = 'Yes';
          newDetected.add('caseColour');
        }

        // Merge any specific extracted attributes (department, key type, material, etc.)
        if (extracted.attributes) {
          Object.entries(extracted.attributes).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
              next[k] = v;
              newDetected.add(k);
            }
          });
        }

        return next;
      });

      // 3. Location & Time
      if (extracted.location && extracted.location !== 'Unknown') {
        const foundLoc = CAMPUS_LOCATIONS.find(l => l.toLowerCase().includes(extracted.location!.toLowerCase()));
        if (foundLoc) {
          setLocation(foundLoc);
          newDetected.add('location');
        } else {
          setLocation('Other Campus Location');
          setCustomLocation(extracted.location);
          newDetected.add('customLocation');
        }
      }

      if (extracted.approxTime && extracted.approxTime !== 'Unknown') {
        setApproxTime(extracted.approxTime);
        newDetected.add('approxTime');
      }

      // 4. Physical Marks & Details
      if (extracted.physicalMarks && extracted.physicalMarks !== 'Unknown') {
        setSafeUniqueDetails(extracted.physicalMarks);
        newDetected.add('safeUniqueDetails');
      }

      // 5. Theft suspicion
      if (extracted.isTheftSuspicious) {
        setIsTheftSuspicious(true);
        if (extracted.theftNotes) setTheftNotes(extracted.theftNotes);
        newDetected.add('theft');
      }

      setDetectedFields(newDetected);
      setConversationalReply(
        extracted.conversationalReply || 
        `Got it 👍 I extracted your item information and pre-filled the relevant questions below:`
      );
      setNlSuccessMsg(`Extracted ${newDetected.size} relevant fields without asking duplicate questions.`);
    } catch (err) {
      console.warn('NLP extraction failed:', err);
    } finally {
      setIsNlParsing(false);
    }
  };

  // Handle Image Upload & Analysis
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setIsAnalyzingImage(true);
      try {
        const result = await api.analyzeImage(dataUrl);
        setImageAnalysis(result);
        if (result.colour && result.colour !== 'Unknown') {
          handleAnswerChange('colour', result.colour);
        }
        if (result.brand && result.brand !== 'Unknown') {
          handleAnswerChange('brand', result.brand);
        }
      } catch (err) {
        console.warn('Image analysis error:', err);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit report to backend
  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const finalLocation = location === 'Other Campus Location' && customLocation.trim() 
      ? customLocation.trim() 
      : location;

    // Derive summary fields for standard database queries while saving complete itemAttributes
    const derivedBrand = answers.brand || answers.institutionName || 'Not Applicable';
    const derivedModel = answers.model || answers.idType || answers.walletType || answers.bagType || answers.keyType || 'Standard';
    const derivedColour = answers.colour || answers.idCardColour || answers.strapColour || 'Standard';
    const derivedHasCase = answers.hasCase || 'No';
    const derivedCaseColour = answers.caseColour || 'None';
    const derivedCaseDesign = answers.caseDesign || 'None';
    const derivedMarks = answers.physicalMarks || answers.stickers || answers.keychainDesign || 'None';
    const derivedAccessories = answers.accessories || answers.lanyard || answers.cableIncluded || 'None';
    const derivedLockType = answers.lockType || 'Not Applicable';

    try {
      const res = await api.createReport({
        type,
        category,
        itemType,
        brand: derivedBrand,
        model: derivedModel,
        colour: derivedColour,
        hasCase: derivedHasCase,
        caseColour: derivedCaseColour,
        caseDesign: derivedCaseDesign,
        physicalMarks: derivedMarks,
        accessories: derivedAccessories,
        location: finalLocation,
        dateLostFound,
        approxTime,
        lockType: derivedLockType,
        safeUniqueDetails: safeUniqueDetails || answers.safeUniqueDetails || 'None',
        privateVerificationSecret: type === 'LOST' ? privateVerificationSecret : undefined,
        imageUrl: imagePreview || '',
        imageAnalysis: imageAnalysis || undefined,
        isTheftSuspicious,
        theftNotes: isTheftSuspicious ? (theftNotes || 'Suspected theft or taken under suspicious circumstances') : undefined,
        itemAttributes: answers, // Stores dynamic item-specific answers
      });

      onSuccess(res.report);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit report. Please retry.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Back & Flow Badge */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <button
          id="report-back-btn"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            type === 'LOST' 
              ? 'bg-rose-100 text-rose-700 border border-rose-200' 
              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}>
            <Sparkles className="h-3 w-3" />
            <span>{type === 'LOST' ? 'Report Lost Item' : 'Report Found Item'}</span>
          </span>
        </div>
      </div>

      {step === 'QUESTIONS' ? (
        <div className="space-y-8">
          {/* Conversational Natural Language Assistant Banner */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/95 via-blue-50/50 to-white p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">CampusFind AI Conversational Assistant</h4>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                    English • தமிழ் • Tanglish Supported
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Describe what you lost or found naturally in your own words. The AI will understand the item, auto-select its category, and only ask relevant questions without repeating what you already told it:
                </p>

                <form onSubmit={handleNlExtract} className="mt-3 flex gap-2">
                  <input
                    id="nl-prompt-input"
                    type="text"
                    value={nlInput}
                    onChange={(e) => setNlInput(e.target.value)}
                    placeholder='e.g. "Black Samsung S23 da, blue cover irukku" or "Lost CSE College ID Card near canteen"'
                    className="flex-1 rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                  />
                  <button
                    id="nl-parse-btn"
                    type="submit"
                    disabled={isNlParsing || !nlInput.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {isNlParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>{isNlParsing ? 'Understanding...' : 'AI Understand'}</span>
                  </button>
                </form>

                {conversationalReply && (
                  <div className="mt-3 rounded-xl border border-indigo-200 bg-white/90 p-3 text-xs text-slate-800 shadow-2xs flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-indigo-900 block mb-0.5">AI Response:</span>
                      <p className="text-slate-700">{conversationalReply}</p>
                    </div>
                  </div>
                )}

                {nlSuccessMsg && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{nlSuccessMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 1: Category & Specific Item Type (The Dynamic Trigger) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Step 1 of 4</span>
                <h3 className="text-lg font-bold text-slate-900">Select Item Classification</h3>
              </div>
              <span className="text-xs text-slate-500 italic hidden sm:inline">
                Questions dynamically configure based on your selection
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Item Category *
                </label>
                <select
                  id="form-category-select"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                >
                  {Object.keys(CATEGORY_DATA).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Specific Item Type *
                </label>
                <select
                  id="form-itemtype-select"
                  value={itemType}
                  onChange={(e) => handleItemTypeChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-indigo-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                >
                  {(CATEGORY_DATA[category] || []).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Intelligent Dynamic Item Questions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Step 2 of 4</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Item-Specific Details: <span className="text-indigo-600">{itemType}</span>
                </h3>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Only asking relevant questions</span>
              </div>
            </div>

            {/* Render dynamic question fields */}
            <div className="space-y-5">
              {currentQuestions.map((q: DynamicQuestion) => {
                // Check if conditional question should be hidden
                if (q.condition && !q.condition(answers)) {
                  return null;
                }

                const currentVal = answers[q.id];
                const isAutoDetected = detectedFields.has(q.id);

                // If options depend on brand (e.g. Phone or Laptop models)
                let optionsToRender = q.options || [];
                if (q.dependsOnBrand) {
                  optionsToRender = getModelsForBrand(itemType, answers.brand || '');
                }

                return (
                  <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <span>{q.label}</span>
                        {q.required && <span className="text-rose-500">*</span>}
                      </label>

                      {isAutoDetected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                          <Check className="h-3 w-3" />
                          <span>Captured from your description</span>
                        </span>
                      )}
                    </div>

                    {q.helperText && (
                      <p className="text-xs text-slate-500 mb-2">{q.helperText}</p>
                    )}

                    {/* Question Type: Select */}
                    {q.type === 'select' && (
                      <select
                        id={`question-${q.id}`}
                        value={currentVal || (optionsToRender[0] ? getOptionValue(optionsToRender[0]) : '')}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                      >
                        {optionsToRender.map((opt) => {
                          const val = getOptionValue(opt);
                          const lbl = getOptionLabel(opt);
                          return (
                            <option key={val} value={val}>{lbl}</option>
                          );
                        })}
                      </select>
                    )}

                    {/* Question Type: Radio (Pill Buttons) */}
                    {q.type === 'radio' && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(q.options || []).map((opt) => {
                          const val = getOptionValue(opt);
                          const lbl = getOptionLabel(opt);
                          const isSelected = currentVal === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, val)}
                              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {lbl}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Question Type: Checkbox Group */}
                    {q.type === 'checkbox-group' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {(q.options || []).map((opt) => {
                          const val = getOptionValue(opt);
                          const lbl = getOptionLabel(opt);
                          const checkedList: string[] = Array.isArray(currentVal) ? currentVal : [];
                          const isChecked = checkedList.includes(val);
                          return (
                            <label
                              key={val}
                              className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                                isChecked
                                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxToggle(q.id, val)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{lbl}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Question Type: Text Input */}
                    {q.type === 'text' && (
                      <input
                        id={`question-${q.id}`}
                        type="text"
                        placeholder={q.placeholder}
                        value={currentVal || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                      />
                    )}

                    {/* Question Type: Textarea */}
                    {q.type === 'textarea' && (
                      <textarea
                        id={`question-${q.id}`}
                        rows={2}
                        placeholder={q.placeholder}
                        value={currentVal || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                      />
                    )}

                    {/* Privacy notice if applicable (e.g. for ID cards or sensitive items) */}
                    {q.privacyNotice && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/70">
                        <Lock className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                        <span>{q.privacyNotice}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Campus Location & Time Frame (Universal) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Step 3 of 4</span>
              <h3 className="text-lg font-bold text-slate-900">Campus Location &amp; Time Frame</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Campus Location *
                </label>
                <select
                  id="form-location-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>

                {location === 'Other Campus Location' && (
                  <input
                    id="form-custom-location"
                    type="text"
                    placeholder="Enter specific campus spot"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 outline-hidden"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Date Lost or Found *
                </label>
                <select
                  id="form-date-select"
                  value={dateLostFound}
                  onChange={(e) => setDateLostFound(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                >
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="2-3 Days Ago">2-3 Days Ago</option>
                  <option value="Within This Week">Within This Week</option>
                  <option value="Earlier This Month">Earlier This Month</option>
                  <option value="I Don't Know">I Don't Know</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Approximate Time *
                </label>
                <input
                  id="form-time-input"
                  type="text"
                  placeholder="e.g. Around 1:30 PM, Morning Lab period"
                  value={approxTime}
                  onChange={(e) => setApproxTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Verification Shield, Theft Detection & Optional Photo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Step 4 of 4</span>
              <h3 className="text-lg font-bold text-slate-900">Verification Shield &amp; Security</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Safe Distinguishing Feature (Visible or Identifiable)
              </label>
              <input
                id="form-safe-details"
                type="text"
                placeholder="e.g. Tiny sticker on bottom edge, small corner scratch, blue keychain attached"
                value={safeUniqueDetails}
                onChange={(e) => setSafeUniqueDetails(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                This enables automatic correlation with matching reports without exposing private confidential secrets.
              </p>
            </div>

            {type === 'LOST' && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">
                  Private Verification Challenge Answer (Never Shown Publicly)
                </label>
                <input
                  id="form-private-secret"
                  type="text"
                  placeholder="e.g. Wallpaper picture, initials engraved inside, student ID number"
                  value={privateVerificationSecret}
                  onChange={(e) => setPrivateVerificationSecret(e.target.value)}
                  className="w-full rounded-lg border border-indigo-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-hidden"
                />
                <p className="mt-1 text-[11px] text-indigo-700">
                  When a finder reports a matching item, this secret answer is checked before handover to prevent false claims.
                </p>
              </div>
            )}

            {/* Theft Flagging */}
            {type === 'LOST' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="theft-checkbox"
                    type="checkbox"
                    checked={isTheftSuspicious}
                    onChange={(e) => setIsTheftSuspicious(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-amber-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="theft-checkbox" className="text-sm font-bold text-amber-900 cursor-pointer">
                      I suspect this item was stolen or taken under suspicious circumstances
                    </label>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Flagging suspicious loss automatically notifies Campus Security and sets up high-priority surveillance monitoring.
                    </p>

                    {isTheftSuspicious && (
                      <div className="mt-3">
                        <textarea
                          id="theft-notes-input"
                          rows={2}
                          value={theftNotes}
                          onChange={(e) => setTheftNotes(e.target.value)}
                          placeholder="Provide any suspicious context (e.g. left unattended for 5 mins in cafeteria, someone was seen hovering around)..."
                          className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-slate-900 focus:border-amber-500 outline-hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Photo Upload & AI Vision */}
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Item Photo (Optional — AI Vision Analysis)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-1/2 relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-5 text-center hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer transition">
                  <Upload className="h-6 w-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Upload item photo</span>
                  <span className="text-[11px] text-slate-500">JPG or PNG under 5MB</span>
                  <input
                    id="report-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="sr-only"
                  />
                </label>

                {imagePreview && (
                  <div className="w-full sm:w-1/2 flex flex-col items-center">
                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="h-full w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageAnalysis(null);
                        }}
                        className="absolute top-2 right-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isAnalyzingImage && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>Analyzing visible characteristics via AI Vision...</span>
                </div>
              )}

              {imageAnalysis && (
                <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 uppercase tracking-wider">AI Visual Analysis</span>
                    <span className="rounded-md bg-indigo-200/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
                      AI Estimated
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                    <div><strong>Detected Colour:</strong> {imageAnalysis.colour || 'N/A'}</div>
                    <div><strong>Shape / Profile:</strong> {imageAnalysis.shape || 'N/A'}</div>
                    <div><strong>Visible Brand:</strong> {imageAnalysis.brand || 'N/A'}</div>
                    <div><strong>Marks / Wear:</strong> {imageAnalysis.marks || 'None'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="report-cancel-btn"
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="report-review-summary-btn"
              type="button"
              onClick={() => setStep('SUMMARY')}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.99] transition cursor-pointer"
            >
              REVIEW SUMMARY →
            </button>
          </div>
        </div>
      ) : (
        /* Summary Mode */
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">AI Report Verification</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Item Report Summary</h2>
              <p className="text-sm text-slate-500">
                Please verify the item-specific parameters before saving your official record.
              </p>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Report Classification</span>
                <span className="font-bold text-slate-900">{type} Report</span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-900">{category}</span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Specific Item</span>
                <span className="font-bold text-indigo-900">{itemType}</span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Campus Location</span>
                <span className="font-semibold text-slate-900">
                  {location === 'Other Campus Location' && customLocation ? customLocation : location}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Date &amp; Time</span>
                <span className="font-semibold text-slate-900">{dateLostFound} — {approxTime}</span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Safe Distinguishing Feature</span>
                <span className="font-semibold text-slate-900">{safeUniqueDetails || 'None stated'}</span>
              </div>

              {/* Dynamic Item-Specific Answers Display (Only relevant attributes!) */}
              {currentQuestions.map((q) => {
                if (q.condition && !q.condition(answers)) return null;
                const val = answers[q.id];
                if (val === undefined || val === null || val === '') return null;

                const displayVal = Array.isArray(val) ? val.join(', ') : String(val);

                return (
                  <div key={q.id} className="border-b border-slate-100 pb-2">
                    <span className="text-xs uppercase font-semibold text-indigo-700 block">{q.label}</span>
                    <span className="font-semibold text-slate-900">{displayVal}</span>
                  </div>
                );
              })}

              {isTheftSuspicious && (
                <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <strong className="block text-amber-950 font-bold mb-0.5">THEFT / SUSPICIOUS CIRCUMSTANCES FLAGGED</strong>
                  <span>{theftNotes || 'Item logged as suspected theft for priority security monitoring.'}</span>
                </div>
              )}
            </div>

            {imagePreview && (
              <div className="rounded-xl border border-slate-200 p-3 flex items-center gap-4 bg-slate-50">
                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Photo Attached</span>
                  <span className="text-xs text-slate-500">Visual features verified and included in automatic matching index.</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                id="summary-edit-btn"
                type="button"
                onClick={() => setStep('QUESTIONS')}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                EDIT
              </button>

              <button
                id="summary-confirm-create-btn"
                type="button"
                disabled={submitting}
                onClick={handleConfirmSubmit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>SAVING REPORT &amp; RUNNING MATCHES...</span>
                  </>
                ) : (
                  <span>CONFIRM &amp; CREATE REPORT</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
