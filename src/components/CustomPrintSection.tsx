import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Calculator, Sparkles, Layers, Clock, Cpu, Upload } from 'lucide-react';
import { ProductCategory, FilamentMaterial, CustomInquiry } from '../types';
import { calculatePrintEstimate } from '../utils/estimateLogic';

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

  // Interactive Estimator Parameters
  const [estWidth, setEstWidth] = useState(150);
  const [estDepth, setEstDepth] = useState(150);
  const [estHeight, setEstHeight] = useState(180);
  const [estLayerHeight, setEstLayerHeight] = useState(0.16);
  const [estInfill, setEstInfill] = useState(20);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<CustomInquiry | null>(null);

  // Update description if initialItemName changes
  useEffect(() => {
    if (initialItemName) {
      setDescription(`I would like to request a custom commission based on "${initialItemName}".`);
    }
  }, [initialItemName]);

  // Live estimate calculation
  const estimate = calculatePrintEstimate({
    category: projectCategory,
    widthMm: estWidth,
    depthMm: estDepth,
    heightMm: estHeight,
    layerHeightMm: estLayerHeight,
    infillPercent: estInfill,
    material: materialPreference,
    quantity: quantity,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
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
        referenceUrlOrNotes: referenceFile,
      };
      setSubmittedInquiry(inquiryData);
      setIsSubmitting(false);
    }, 600);
  };

  const handleReset = () => {
    setSubmittedInquiry(null);
    setDescription('');
    setFullName('');
    setEmail('');
    setPhone('');
    setReferenceFile('');
  };

  return (
    <section id="custom-prints" className="scroll-mt-24 relative py-16 sm:py-24 bg-[#101010] border-t border-[#1C1C20] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#E7A96B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-[#E7A96B] uppercase">
            Bespoke Fabrication
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5F3EF] mt-2">
            Have an idea? Let&apos;s make it real.
          </h2>
          <p className="text-base text-[#A1A1AA] mt-4 leading-relaxed font-normal">
            From personalized gifts to unique decorative pieces, bring your concept to AV Creation and explore what&apos;s possible with 3D printing.
          </p>
        </div>

        {/* 4-Step Studio Process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            {
              step: '01',
              title: 'Concept & Reference',
              desc: 'Share a sketch, description, or 3D CAD model (.STL, .OBJ, .STEP). We evaluate buildability and structural geometry.',
            },
            {
              step: '02',
              title: 'Slicing & Optimization',
              desc: 'Custom toolpath programming with tuned layer heights (0.08–0.24mm) and gyroid infill orientations for flawless surfaces.',
            },
            {
              step: '03',
              title: 'Filament Curation',
              desc: 'Choose from translucent PETG, dichromatic silk PLA, carbon fiber composites, and stone textures.',
            },
            {
              step: '04',
              title: 'Precision Print & Finish',
              desc: 'Produced on calibrated coreXY extruders, carefully demolded, post-processed, and inspected before dispatch.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-lg bg-[#141416] border border-[#222226] relative flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono text-[#E7A96B] font-semibold">{item.step}.</span>
                <h3 className="text-sm font-bold text-[#F5F3EF] mt-2 mb-2">{item.title}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two-Column Experience: Interactive Estimator (Left) + Inquiry Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Technical Sizing Estimator */}
          <div className="lg:col-span-5 bg-[#141416] border border-[#242428] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#222226] pb-3">
              <Calculator className="w-4 h-4 text-[#E7A96B]" />
              <h3 className="text-sm font-bold text-[#F5F3EF] tracking-tight">
                Live Additive Sizing & Print Estimator
              </h3>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Adjust your object dimensions to see instant physical layer counts, estimated machine print duration, and material requirements.
            </p>

            {/* Dimensional Sliders */}
            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[#D4D4D8] mb-1">
                  <span>Width (X-Axis):</span>
                  <strong className="text-[#E7A96B]">{estWidth} mm</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  value={estWidth}
                  onChange={(e) => setEstWidth(Number(e.target.value))}
                  className="w-full accent-[#E7A96B] bg-[#222226] h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#D4D4D8] mb-1">
                  <span>Depth (Y-Axis):</span>
                  <strong className="text-[#E7A96B]">{estDepth} mm</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  value={estDepth}
                  onChange={(e) => setEstDepth(Number(e.target.value))}
                  className="w-full accent-[#E7A96B] bg-[#222226] h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#D4D4D8] mb-1">
                  <span>Height (Z-Axis):</span>
                  <strong className="text-[#E7A96B]">{estHeight} mm</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="320"
                  value={estHeight}
                  onChange={(e) => setEstHeight(Number(e.target.value))}
                  className="w-full accent-[#E7A96B] bg-[#222226] h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Layer Height & Infill Selection */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-[#8E8E93] block mb-1">Layer Quality</label>
                  <select
                    value={estLayerHeight}
                    onChange={(e) => setEstLayerHeight(Number(e.target.value))}
                    className="w-full bg-[#1A1A1E] text-[#F5F3EF] border border-[#2D2D32] rounded p-1.5 text-xs focus:outline-none"
                  >
                    <option value={0.10}>0.10mm (Ultra-Fine)</option>
                    <option value={0.12}>0.12mm (Fine Detail)</option>
                    <option value={0.16}>0.16mm (Studio Standard)</option>
                    <option value={0.20}>0.20mm (Fast Draft)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#8E8E93] block mb-1">Infill Density</label>
                  <select
                    value={estInfill}
                    onChange={(e) => setEstInfill(Number(e.target.value))}
                    className="w-full bg-[#1A1A1E] text-[#F5F3EF] border border-[#2D2D32] rounded p-1.5 text-xs focus:outline-none"
                  >
                    <option value={15}>15% Gyroid (Light)</option>
                    <option value={22}>22% Gyroid (Balanced)</option>
                    <option value={35}>35% Cubic (Heavy Duty)</option>
                    <option value={60}>60% Structural (Solid)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculated Output Summary Card */}
            <div className="bg-[#18181C] border border-[#27272C] rounded-lg p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#A1A1AA] border-b border-[#232328] pb-2">
                <span>Calculated Metrics:</span>
                <span className="text-[#E7A96B] font-bold">{estimate.difficultyRating}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[#D4D4D8]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#E7A96B]" />
                  <span>Est. Time: <strong>{estimate.estimatedPrintHours}h</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#E7A96B]" />
                  <span>Total Layers: <strong>{estimate.totalLayerCount}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#E7A96B]" />
                  <span>Filament: <strong>{estimate.estimatedWeightGrams}g</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E7A96B]" />
                  <span>Turnaround: <strong>~{estimate.suggestedTurnaroundDays} days</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Order Inquiry Form */}
          <div className="lg:col-span-7 bg-[#141416] border border-[#242428] rounded-xl p-6 sm:p-8">
            {submittedInquiry ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-[#E7A96B]/10 border border-[#E7A96B] flex items-center justify-center mx-auto text-[#E7A96B]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#F5F3EF]">
                  Inquiry Received!
                </h3>
                <p className="text-sm text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#F5F3EF]">{submittedInquiry.fullName}</strong>. We have registered your custom print inquiry for{' '}
                  <span className="text-[#E7A96B] font-mono">{submittedInquiry.estimatedDimensions}</span>. Our studio engineer will review your specifications and reply via{' '}
                  <span className="text-[#F5F3EF]">{submittedInquiry.email}</span> within 24 hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-[#1E1E22] hover:bg-[#2A2A30] text-[#F5F3EF] text-xs font-semibold rounded-md border border-[#2E2E34] transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-[#F5F3EF]">
                  Custom Order Project Brief
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Chen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3.5 py-2.5 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="maya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3.5 py-2.5 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      Project Category
                    </label>
                    <select
                      value={projectCategory}
                      onChange={(e) => setProjectCategory(e.target.value as any)}
                      className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3.5 py-2.5 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                    >
                      <option value="ambient-lighting">Ambient Lighting & Lamps</option>
                      <option value="articulated-collectible">Articulated & Flexi Toys</option>
                      <option value="home-living">Home Decor & Planters</option>
                      <option value="miniature-worlds">Miniature Worlds & Dioramas</option>
                      <option value="custom-creations">Bespoke Mechanical / Prototype</option>
                      <option value="other">Other / Multi-Part Idea</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      Filament Preference
                    </label>
                    <select
                      value={materialPreference}
                      onChange={(e) => setMaterialPreference(e.target.value as any)}
                      className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3.5 py-2.5 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                    >
                      <option value="Studio Recommendation">Studio Recommendation</option>
                      <option value="PLA+ Silk">PLA+ Silk (Metallic Sheen)</option>
                      <option value="Matte PLA">Matte PLA (Earthy & Low Glare)</option>
                      <option value="Translucent PETG">Translucent PETG (Illuminated Glow)</option>
                      <option value="Resin High-Detail">Resin High-Detail (Miniatures)</option>
                      <option value="Carbon Fiber PETG">Carbon Fiber PETG (High Strength)</option>
                      <option value="Wood Composite PLA">Wood Composite PLA (Organic Feel)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Describe Your Vision or Requirements *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details on dimensions, visual aesthetic, reference links, intended use, or specific customizations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3.5 py-2.5 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B] transition-colors leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      File Reference / 3D Model Link (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Printables, Thingiverse, or Drive link"
                        value={referenceFile}
                        onChange={(e) => setReferenceFile(e.target.value)}
                        className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3.5 py-2 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                      Target Schedule
                    </label>
                    <select
                      value={targetTimeline}
                      onChange={(e) => setTargetTimeline(e.target.value as any)}
                      className="w-full bg-[#18181C] border border-[#27272A] rounded-md px-3.5 py-2 text-xs text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                    >
                      <option value="flexible">Flexible (Standard 2 weeks)</option>
                      <option value="2-3-weeks">Target within 2–3 weeks</option>
                      <option value="urgent-1-week">Rush Priority (1 week)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-semibold text-xs uppercase tracking-wider rounded-md transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Transmitting Request...' : 'Submit Custom Print Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
