import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Zap, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { calculateQualityScore } from '../types';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '../components/SEO';
import { SchemaOrg } from '../components/SchemaOrg';

export const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pricingFilter, setPricingFilter] = useState<'All' | 'Free' | 'Premium' | 'Paid'>('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data: productsData, error } = await supabase.from('products').select('*');
        if (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
            return;
        }

        const { data: reviews } = await supabase.from('reviews').select('product_id, stars');

        const productsWithScores = (productsData || []).map((p) => {
            const productReviews = reviews?.filter((r) => r.product_id === p.id) || [];
            const avgRating = productReviews.length > 0
                ? productReviews.reduce((acc, curr) => acc + curr.stars, 0) / productReviews.length
                : 0;

            return {
                ...p,
                quality_score: calculateQualityScore(p, avgRating),
                averageRating: avgRating
            } as Product;
        });

        const sorted = productsWithScores.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
        setProducts(sorted);
        setLoading(false);
    };

    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesPricing = pricingFilter === 'All' || p.pricing === pricingFilter;
        return matchesSearch && matchesPricing;
    });

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": filteredProducts.map((p, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `https://prodspark.com/products/${p.id}`,
            "name": p.name
        }))
    };

    return (
        <div className="min-h-screen pt-12 pb-24">
            <SEO
                title="Elite Tools Directory - Browse Innovative Products"
                description="Explore our curated collection of elite AI tools, devtools, and productivity apps. Filter by pricing and category to find your next digital spark."
                canonical="https://prodspark.com/products"
            />
            <SchemaOrg data={itemListSchema} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header section */}
                <div className="flex flex-col mb-16 space-y-8">
                    <div className="text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-center md:justify-start gap-2 text-primary font-black uppercase tracking-widest text-xs mb-4"
                        >
                            <Zap size={16} fill="currentColor" />
                            <span>Curation of Excellence</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-black text-main tracking-tighter"
                        >
                            Browse The Spark
                        </motion.h1>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={22} />
                            <input
                                type="text"
                                placeholder="Search by name, category, or tags..."
                                className="w-full pl-14 pr-6 py-5 bg-card border-2 border-main rounded-[2rem] focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Premium Dropdown Filter */}
                        <div className="relative w-full lg:w-64">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-between px-8 py-5 bg-card border-2 border-main rounded-[2rem] shadow-sm hover:border-primary/20 transition-all font-black uppercase tracking-widest text-xs"
                            >
                                <span className="flex items-center gap-3">
                                    <SlidersHorizontal size={18} className="text-primary" />
                                    {pricingFilter === 'All' ? 'Pricing Strategy' : pricingFilter}
                                </span>
                                <motion.div
                                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown size={18} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-3 z-20 bg-white dark:bg-slate-950 border-2 border-main rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden p-2"
                                        >
                                            {['All', 'Free', 'Premium', 'Paid'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setPricingFilter(type as any);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-6 py-4 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase transition-all ${pricingFilter === type
                                                        ? 'bg-primary text-white'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-main'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-card rounded-[2rem] aspect-[4/5] md:aspect-[16/10] animate-pulse border-2 border-main" />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                        >
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ProductCard product={p} averageRating={p.averageRating || 0} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-40 flex flex-col items-center">
                                    <div className="bg-card w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-sm border border-main mb-8">
                                        <SlidersHorizontal className="text-slate-300 dark:text-slate-700" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">No tools match your spark</h3>
                                    <p className="text-slate-400 font-medium">Try broadening your search or switching filters.</p>
                                    <button
                                        onClick={() => { setSearchTerm(''); setPricingFilter('All'); }}
                                        className="mt-8 text-primary font-black uppercase tracking-widest text-xs hover:underline"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
