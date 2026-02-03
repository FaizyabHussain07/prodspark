import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
    Rocket, Upload, Plus, X, Globe, Type,
    Tag as TagIcon, CreditCard, Image as ImageIcon,
    ArrowLeft, CheckCircle2, Loader2, Sparkles, Pencil,
    ChevronDown, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createClerkSupabaseClient } from '../supabaseClient';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../utils/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    'AI', 'DevTools', 'Design', 'Marketing', 'Productivity', 'SEO', 'No-Code', 'Other'
];

export const SubmitProduct = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [gallery, setGallery] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'AI',
        link: '',
        description: '',
        pricing: 'Free' as 'Free' | 'Premium' | 'Paid',
        tags: ''
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            if (gallery.length + files.length > 3) {
                toast.error('Maximum 3 additional images allowed');
                return;
            }

            setGallery(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGallery(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !logo) {
            toast.error('Please upload a logo and ensure you are signed in');
            return;
        }

        if (gallery.length > 3) {
            toast.error('Maximum 3 additional images allowed');
            return;
        }

        setLoading(true);
        try {
            // Get Clerk token for Supabase
            const token = await getToken({ template: 'supabase' });
            if (!token) {
                throw new Error('No authentication token found. Please sign in again.');
            }

            // Create authenticated Supabase client
            const authenticatedSupabase = createClerkSupabaseClient(token);

            // 1. Upload Logo
            const logoUrl = await uploadToCloudinary(logo);

            // 2. Upload Gallery (Max 3)
            const galleryUrls = await uploadMultipleToCloudinary(gallery);

            // 3. Save to Supabase
            const { data, error } = await authenticatedSupabase.from('products').insert({
                owner_clerk_id: user.id,
                name: formData.name,
                category: formData.category,
                link: formData.link,
                logo_url: logoUrl,
                description: formData.description,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                pricing: formData.pricing,
                images_urls: galleryUrls,
                likes: [],
                views: 0
            }).select();

            console.log('Supabase insert response:', { data, error });

            if (error) throw error;

            toast.success('Your spark has been ignited!');
            navigate('/products');
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error('Failed to save product: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-12 transition-colors font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft size={18} />
                    Back to directory
                </Link>

                <div className="bg-card rounded-[3rem] border-2 border-main p-8 md:p-16 shadow-3xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                                <Rocket size={40} />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-main leading-tight">Ignite Your Product</h1>
                                <p className="text-slate-400 font-medium">Showcase your innovation to the world's best creators.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            {/* Visual Asset Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-black text-main mb-2 flex items-center gap-2">
                                        <Sparkles size={18} className="text-primary" />
                                        Identity
                                    </h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">Your tool's logo will be its first impression. High resolution recommended.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="group block relative cursor-pointer">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                        <div className={`w-32 h-32 rounded-[2rem] border-4 border-dashed transition-all flex items-center justify-center overflow-hidden
                                            ${logoPreview
                                                ? 'border-primary/20 bg-card'
                                                : 'border-main bg-slate-50 dark:bg-slate-900 group-hover:border-primary/40 group-hover:bg-primary/5'
                                            }`}>
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="text-slate-300 group-hover:text-primary group-hover:scale-110 transition-all" size={32} />
                                            )}
                                        </div>
                                        <span className="block mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                                            {logoPreview ? 'Change Identity' : 'Upload Logo'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <hr className="border-main" />

                            {/* Core Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-main">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                                        <Type size={18} className="text-primary" />
                                        Intelligence
                                    </h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">Basic information about your elite tool.</p>
                                </div>
                                <div className="md:col-span-2 space-y-8">
                                    <div className="relative group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-4">Product Name</label>
                                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 border-2 border-main rounded-2xl px-6 focus-within:border-primary focus-within:bg-card transition-all group">
                                            <Pencil size={18} className="text-slate-300 group-focus-within:text-primary transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. ProdSpark"
                                                className="w-full py-4 px-4 outline-none bg-transparent font-medium"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-4">Access Point (Link)</label>
                                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 border-2 border-main rounded-2xl px-6 focus-within:border-primary focus-within:bg-card transition-all group">
                                            <Globe size={18} className="text-slate-300 group-focus-within:text-primary transition-colors" />
                                            <input
                                                required
                                                type="url"
                                                placeholder="https://your-innovation.com"
                                                className="w-full py-4 px-4 outline-none bg-transparent font-medium"
                                                value={formData.link}
                                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-4">The Narrative (Description)</label>
                                        <div className="bg-slate-50 dark:bg-slate-900 border-2 border-main rounded-3xl px-6 py-2 focus-within:border-primary focus-within:bg-card transition-all">
                                            <textarea
                                                required
                                                rows={5}
                                                placeholder="What problem are you solving? Be descriptive but concise."
                                                className="w-full py-4 outline-none bg-transparent font-medium resize-none"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-main" />

                            {/* Meta Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-main">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                                        <TagIcon size={18} className="text-primary" />
                                        Classification
                                    </h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">Categorize your tool for easy discovery.</p>
                                </div>
                                <div className="md:col-span-2 space-y-8">
                                    <div className="relative">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-4">Core Category</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                            className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-main rounded-2xl hover:border-primary/20 transition-all font-medium"
                                        >
                                            <span className="flex items-center gap-3">
                                                <Layers size={18} className="text-primary" />
                                                {formData.category}
                                            </span>
                                            <motion.div animate={{ rotate: isCategoryOpen ? 180 : 0 }}>
                                                <ChevronDown size={18} />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isCategoryOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-20" onClick={() => setIsCategoryOpen(false)} />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute top-full left-0 right-0 mt-3 z-30 bg-white dark:bg-slate-950 border-2 border-main rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2 overflow-hidden"
                                                    >
                                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                            {CATEGORIES.map(cat => (
                                                                <button
                                                                    key={cat}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, category: cat });
                                                                        setIsCategoryOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${formData.category === cat
                                                                        ? 'bg-primary text-white'
                                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                                                                        }`}
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="relative group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-4">Pricing Model</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['Free', 'Premium', 'Paid'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, pricing: type as any })}
                                                    className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2
                                                        ${formData.pricing === type
                                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                            : 'bg-slate-50 dark:bg-slate-900 border-main text-slate-400 hover:border-primary/20'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-4">Tags (Comma Separated)</label>
                                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 border-2 border-main rounded-2xl px-6 focus-within:border-primary focus-within:bg-card transition-all group">
                                            <CreditCard size={18} className="text-slate-300 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="ai, dev-tools, design, productivity"
                                                className="w-full py-4 px-4 outline-none bg-transparent font-medium"
                                                value={formData.tags}
                                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-main" />

                            {/* Gallery Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-main">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                                        <ImageIcon size={18} className="text-primary" />
                                        Visual Intel
                                    </h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">Add screenshots or mockups of your interface.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {galleryPreviews.map((url, i) => (
                                            <div key={i} className="relative aspect-video rounded-2xl overflow-hidden group shadow-md border-2 border-main">
                                                <img src={url} alt="Gallery Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(i)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {galleryPreviews.length < 3 && (
                                            <label className="aspect-video bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-main rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group text-slate-300 hover:text-primary">
                                                <input type="file" className="hidden" multiple accept="image/*" onChange={handleGalleryChange} />
                                                <Plus size={24} className="group-hover:scale-110 transition-all" />
                                                <span className="mt-2 text-[10px] font-black uppercase tracking-widest">Add Preview</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="btn-primary w-full flex items-center justify-center gap-4 py-6 text-xl shadow-2xl relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center gap-4">
                                        {loading ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                Igniting The Spark...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={24} />
                                                Launch Intelligence Now
                                            </>
                                        )}
                                    </span>
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </button>
                                <p className="text-center mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700">Premium Submission Node 0x7F42</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
