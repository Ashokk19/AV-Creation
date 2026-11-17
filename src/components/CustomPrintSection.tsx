import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Upload } from 'lucide-react';
import { ProductCategory, FilamentMaterial, CustomInquiry } from '../types';
import { submitEnquiry } from '../services/enquiryService';

interface CustomPrintSectionProps {
  initialItemName?: string;
}

export const CustomPrintSection: React.FC<CustomPrintSectionProps> = ({
  initialItemName = '',
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectCategory, setProjectCategory] = useState<ProductCategory | 'other'>('ambient-lighting');
  const [materialPreference, setMaterialPreference] = useState<FilamentMaterial | 'Studio Recommendation'>('Studio Recommendation');
  const [description, setDescription] = useState(
    initialItemName ? `I am interested in ordering a custom variation of "${initialItemName}". Details: ` : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [targetTimeline, setTargetTimeline] = useState<'flexible' | '2-3-weeks' | 'urgent-1-week'>('flexible');
  const [referenceFile, setReferenceFile] = useState<string>('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [estWidth] = useState(150);
  const [estDepth] = useState(150);
  const [estHeight] = useState(180);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<CustomInquiry | null>(null);

  useEffect(() => {
    if (initialItemName) {
      setDescription(`I would like to request a custom commission based on "${initialItemName}".`);
    }
  }, [initialItemName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !description.trim()) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitEnquiry(
        {
          customer_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          project_category: projectCategory,
          description: description.trim(),
          reference_link: referenceFile.trim() || undefined,
          dimensions: `${estWidth} × ${estDepth} × ${estHeight} mm`,
          material_preference: materialPreference,
          quantity: quantity,
          target_timeline: targetTimeline,
        },
        attachmentFile
      );

      const inquiryData: CustomInquiry = {
        fullName,
        email,
        phone,
        projectCategory,
        materialPreference,
        description,
        quantity,
        targetTimeline,
        estimatedDimensions: `${estWidth} × ${estDepth} × ${estHeight} mm`,
        referenceUrlOrNotes: attachmentFile ? `${attachmentFile.name} (Uploaded)` : referenceFile,
      };
      setSubmittedInquiry(inquiryData);
    } catch (err: any) {
      console.error('Failed to submit enquiry:', err);
      setSubmitError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedInquiry(null);
    setDescription('');
    setFullName('');
    setEmail('');
    setPhone('');
    setReferenceFile('');
    setAttachmentFile(null);
    setQuantity(1);
    setSubmitError(null);
  };

  const steps = [
    {
      step: '01',
      title: 'Concept & Reference',
      desc: 'Share a sketch, photograph, or 3D model (.STL, .OBJ, .STEP) for feasibility evaluation.',
    },
    {
      step: '02',
      title: 'Slicing & Toolpaths',
      desc: 'Tuned layer heights and structural infill orientations balanced for finish and strength.',
    },
    {
      step: '03',
      title: 'Material Selection',
      desc: 'Choose silk PLA+, translucent PETG, carbon composites, wood blends, or crisp resin.',
    },
    {
      step: '04',
      title: 'Print & Hand Finish',
      desc: 'Fabricated on calibrated CoreXY machines, trimmed cleanly by hand, and studio inspected.',
    },
  ];

  return (
    <section
      id="custom-prints"
      className="scroll-mt-24 max-w-[1080px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(43,39,33,0.56)] mb-4">
        Bespoke Commissions
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-10">
        <div className="lg:col-span-7">
          <h2 className="sb-display text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] text-[#2b2721] [text-wrap:balance]">
            Have an idea? <span className="italic text-[#9a6a3e]">Let&apos;s make it real.</span>
          </h2>
        </div>
        <div className="lg:col-span-5">
          <p className="sb-prose text-base sm:text-[18px] leading-[1.68] text-[rgba(43,39,33,0.78)]">
            From personalized keepsakes to bespoke lamps and studio fixtures, send us your reference brief.
          </p>
        </div>
      </div>

      {/* 4-Step Editorial Studio Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[rgba(43,39,33,0.14)] bg-[rgba(250,247,239,0.55)] mb-12">
        {steps.map((item) => (
          <div
            key={item.step}
            className="p-5 border-r border-b border-[rgba(43,39,33,0.14)] space-y-2"
          >
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#9a6a3e] tabular-nums block">
              {item.step}
            </span>
            <h3 className="sb-display text-xl text-[#2b2721]">{item.title}</h3>
            <p className="sb-prose text-xs sm:text-sm text-[rgba(43,39,33,0.72)] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Stationery Commission Brief Card */}
      <div className="max-w-3xl mx-auto w-full bg-[#f7f3e9] border border-[rgba(43,39,33,0.16)] rounded-sm p-6 sm:p-8 shadow-[0_14px_38px_rgba(43,39,33,0.08)]">
        {submittedInquiry ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-sm bg-[rgba(154,106,62,0.12)] border border-[#9a6a3e] flex items-center justify-center mx-auto text-[#784f2b]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="sb-display text-3xl text-[#2b2721]">Inquiry Received</h3>
            <p className="sb-prose text-base text-[rgba(43,39,33,0.78)] max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-[#2b2721]">{submittedInquiry.fullName}</strong>. We have registered your custom print commission brief and will reply via{' '}
              <span className="text-[#784f2b]">{submittedInquiry.email}</span> within 24 hours.
            </p>
            <div className="pt-3">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] text-xs uppercase tracking-[0.18em] rounded-sm transition-colors cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(43,39,33,0.12)]">
              <h3 className="sb-display text-2xl text-[#2b2721]">
                Custom Order Project Brief
              </h3>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[rgba(43,39,33,0.56)]">
                24h Studio Reply
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2.5 text-sm text-[#2b2721] placeholder-[rgba(43,39,33,0.4)] focus:outline-none focus:border-[#784f2b]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="maya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2.5 text-sm text-[#2b2721] placeholder-[rgba(43,39,33,0.4)] focus:outline-none focus:border-[#784f2b]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2.5 text-sm text-[#2b2721] placeholder-[rgba(43,39,33,0.4)] focus:outline-none focus:border-[#784f2b]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2.5 text-sm tabular-nums text-[#2b2721] focus:outline-none focus:border-[#784f2b]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                  Project Category
                </label>
                <select
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value as any)}
                  className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2.5 text-sm text-[#2b2721] focus:outline-none focus:border-[#784f2b]"
                >
                  <option value="ambient-lighting">Ambient Lighting &amp; Lamps</option>
                  <option value="articulated-collectible">Articulated &amp; Flexi Toys</option>
                  <option value="home-living">Home Decor &amp; Planters</option>
                  <option value="miniature-worlds">Miniature Worlds &amp; Dioramas</option>
                  <option value="custom-creations">Bespoke Mechanical / Prototype</option>
                  <option value="other">Other / Multi-Part Idea</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                  Filament Preference
                </label>
                <select
                  value={materialPreference}
                  onChange={(e) => setMaterialPreference(e.target.value as any)}
                  className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2.5 text-sm text-[#2b2721] focus:outline-none focus:border-[#784f2b]"
                >
                  <option value="Studio Recommendation">Studio Recommendation</option>
                  <option value="PLA+ Silk">PLA+ Silk (Metallic Sheen)</option>
                  <option value="Matte PLA">Matte PLA (Earthy &amp; Low Glare)</option>
                  <option value="Translucent PETG">Translucent PETG (Illuminated Glow)</option>
                  <option value="Resin High-Detail">Resin High-Detail (Miniatures)</option>
                  <option value="Carbon Fiber PETG">Carbon Fiber PETG (High Strength)</option>
                  <option value="Wood Composite PLA">Wood Composite PLA (Organic Feel)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                Describe Your Vision or Requirements *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide details on dimensions, visual aesthetic, reference links, intended use, or customizations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2.5 text-sm text-[#2b2721] placeholder-[rgba(43,39,33,0.4)] focus:outline-none focus:border-[#784f2b] leading-relaxed"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                  Attach Reference Photo / 3D Model / Blueprint (Optional, max 10MB)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#faf7ef] hover:bg-white border border-[rgba(43,39,33,0.22)] hover:border-[#784f2b] rounded-sm text-xs text-[#784f2b] font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{attachmentFile ? 'Change File' : 'Choose File'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.stl,.obj,.pdf,.zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            setSubmitError('Attachment exceeds 10MB limit.');
                            return;
                          }
                          setSubmitError(null);
                          setAttachmentFile(file);
                        }
                      }}
                    />
                  </label>
                  {attachmentFile && (
                    <div className="flex items-center gap-2 text-xs text-[#2b2721] bg-[#faf7ef] px-3 py-1.5 rounded-sm border border-[rgba(43,39,33,0.18)]">
                      <span className="truncate max-w-[200px] text-xs">{attachmentFile.name}</span>
                      <span className="text-[11px] text-[rgba(43,39,33,0.58)] tabular-nums">
                        ({(attachmentFile.size / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachmentFile(null)}
                        className="text-[rgba(43,39,33,0.6)] hover:text-[#784f2b] text-xs ml-1 cursor-pointer"
                        aria-label="Remove attachment"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                    External Model Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={referenceFile}
                    onChange={(e) => setReferenceFile(e.target.value)}
                    className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2 text-sm text-[#2b2721] placeholder-[rgba(43,39,33,0.4)] focus:outline-none focus:border-[#784f2b]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[rgba(43,39,33,0.72)] mb-1.5">
                    Target Schedule
                  </label>
                  <select
                    value={targetTimeline}
                    onChange={(e) => setTargetTimeline(e.target.value as any)}
                    className="w-full bg-[#faf7ef] border border-[rgba(43,39,33,0.18)] rounded-sm px-3.5 py-2 text-sm text-[#2b2721] focus:outline-none focus:border-[#784f2b]"
                  >
                    <option value="flexible">Flexible (Standard 2 weeks)</option>
                    <option value="2-3-weeks">Target within 2–3 weeks</option>
                    <option value="urgent-1-week">Rush Priority (1 week)</option>
                  </select>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-sm text-xs text-red-800">
                {submitError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-[#2b2721] hover:bg-[#784f2b] text-[#faf7ef] font-medium text-xs uppercase tracking-[0.2em] rounded-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting ? 'Submitting Request...' : 'Submit Custom Print Inquiry'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
