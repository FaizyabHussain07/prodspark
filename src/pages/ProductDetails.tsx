import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
    Heart, ExternalLink, ArrowLeft, MessageSquare,
    Info, Loader2, Sparkles, Zap, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase, createClerkSupabaseClient } from '../supabaseClient';
import { calculateQualityScore } from '../types';
import type { Product, Review } from '../types';
import { StarRating } from '../components/StarRating';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { SchemaOrg } from '../components/SchemaOrg';

export const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const { getToken } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [newReview, setNewReview] = useState({ text: '', stars: 5 });

    useEffect(() => {
        if (id) {
            fetchProductAndReviews();
            incrementViews();
        }
    }, [id]);

    const fetchProductAndReviews = async () => {
        const { data: productData } = await supabase.from('products').select('*').eq('id', id).single();
        const { data: reviewsData } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false });

        if (productData) {
            const avgRating = reviewsData && reviewsData.length > 0
                ? reviewsData.reduce((acc, curr) => acc + curr.stars, 0) / reviewsData.length
                : 0;

            setProduct({
                ...productData,
                quality_score: calculateQualityScore(productData, avgRating)
            } as Product);
            setReviews(reviewsData || []);
        }
        setLoading(false);
    };

    const incrementViews = async () => {
        const sessionKey = `viewed_${id}`;
        if (!sessionStorage.getItem(sessionKey)) {
            await supabase.rpc('increment_views', { product_id: id });
            sessionStorage.setItem(sessionKey, 'true');
        }
    };

    const handleLike = async () => {
        if (!user) {
            toast.error('Sign in to like this product');
            return;
        }

        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error('Auth token missing');
            const authenticatedSupabase = createClerkSupabaseClient(token);

            const isLiked = product?.likes.includes(user.id);
            const newLikes = isLiked
                ? product?.likes.filter(uid => uid !== user.id)
                : [...(product?.likes || []), user.id];

            const { error } = await authenticatedSupabase
                .from('products')
                .update({ likes: newLikes })
                .eq('id', id);

            if (!error && product) {
                setProduct({ ...product, likes: newLikes || [] });
                toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites!');
            } else if (error) {
                throw error;
            }
        } catch (error: any) {
            console.error('Like error:', error);
            toast.error('Failed to update like status');
        }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!newReview.text.trim()) return;

        setReviewLoading(true);
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error('Auth token missing');
            const authenticatedSupabase = createClerkSupabaseClient(token);

            const { data, error } = await authenticatedSupabase.from('reviews').insert({
                product_id: id,
                user_clerk_id: user.id,
                text: newReview.text,
                stars: newReview.stars
            }).select().single();

            if (error) {
                toast.error('Failed to post review: ' + error.message);
            } else {
                setReviews([data, ...reviews]);
                setNewReview({ text: '', stars: 5 });
                toast.success('Review shared with the community!');
                fetchProductAndReviews(); // Refresh score
            }
        } catch (error: any) {
            console.error('Review error:', error);
            toast.error('Failed to post review');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Loader2 className="text-primary mb-6" size={60} />
                </motion.div>
                <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-sm">Igniting the Spark</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-40 text-center">
                <h2 className="text-4xl font-black mb-6">Tool Disappeared!</h2>
                <Link to="/products" className="btn-primary inline-flex">Back to directory</Link>
            </div>
        );
    }

    const avgRating = reviews.length > 0
        ? reviews.reduce((acc, curr) => acc + curr.stars, 0) / reviews.length
        : 0;

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.logo_url,
        "brand": {
            "@type": "Brand",
            "name": product.name
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": product.link
        },
        ...(reviews.length > 0 ? {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": avgRating.toFixed(1),
                "reviewCount": reviews.length
            }
        } : {})
    };

    return (
        <div className="min-h-screen">
            <SEO
                title={`${product.name} - ${product.category || 'Elite Tool'} Review & Details`}
                description={product.description.substring(0, 160)}
                image={product.logo_url}
                url={`https://prodspark.com/products/${id}`}
                type="product"
            />
            <SchemaOrg data={productSchema} />

            {/* Header Area */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-main relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                    <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-main mb-12 transition-colors font-bold uppercase tracking-widest text-xs">
                        <ArrowLeft size={18} />
                        Back to Catalog
                    </Link>

                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <img
                                src={`${product.logo_url}?q_auto,f_auto,w_400`}
                                alt={product.name}
                                loading="eager"
                                className="w-40 h-40 rounded-[2.5rem] object-cover shadow-2xl border-4 border-card"
                            />
                            <div className="absolute -bottom-3 -right-3 bg-secondary text-white p-3 rounded-2xl shadow-xl">
                                <Zap size={20} fill="currentColor" className="text-orange-400" />
                            </div>
                        </motion.div>

                        <div className="flex-grow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <h1 className="text-5xl md:text-6xl font-black leading-none">{product.name}</h1>
                                        <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-primary/20 flex items-center gap-1.5 self-end mb-1">
                                            <Layers size={12} />
                                            {product.category || 'General'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-main shadow-sm">
                                            <StarRating rating={Math.round(avgRating)} />
                                            <span className="font-black">{avgRating.toFixed(1)}</span>
                                            <span className="text-slate-400 text-xs font-bold uppercase ml-1">({reviews.length})</span>
                                        </div>
                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                                        <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${product.pricing === 'Free' ? 'bg-green-500 text-white' :
                                            product.pricing === 'Premium' ? 'bg-orange-500 text-white' :
                                                'bg-indigo-600 text-white'
                                            }`}>
                                            {product.pricing}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all border-2 ${product.likes.includes(user?.id || '')
                                            ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500 shadow-lg shadow-red-100 dark:shadow-none'
                                            : 'bg-card border-main text-slate-400 hover:border-red-100 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                            }`}
                                    >
                                        <Heart size={24} className={product.likes.includes(user?.id || '') ? 'fill-current' : ''} />
                                        {product.likes.length}
                                    </motion.button>
                                    <a
                                        href={product.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary"
                                    >
                                        Visit Experience
                                        <ExternalLink size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-3 gap-24 font-sans text-main">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-20">
                    {/* Description */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-secondary dark:bg-slate-800 rounded-xl flex items-center justify-center text-white">
                                <Info size={24} />
                            </div>
                            <h2 className="text-3xl font-black">Discovery Journey</h2>
                        </div>
                        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                            {product.description}
                        </p>
                    </section>

                    {/* Gallery */}
                    {(product.images_urls || []).length > 0 && (
                        <section>
                            <h2 className="text-3xl font-black mb-10">Visual Preview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {product.images_urls.map((url, i) => (
                                    <motion.img
                                        whileHover={{ scale: 1.02 }}
                                        key={url}
                                        src={`${url}?q_auto,f_auto,w_800`}
                                        alt={`Preview ${i}`}
                                        loading="lazy"
                                        className="rounded-[2.5rem] w-full aspect-video object-cover border-4 border-main shadow-xl"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Tags */}
                    <section>
                        <h3 className="font-black text-slate-300 dark:text-slate-700 text-xs uppercase tracking-[0.3em] mb-6">Classified Under</h3>
                        <div className="flex flex-wrap gap-3">
                            {(product.tags || []).map(tag => (
                                <span key={tag} className="bg-card px-6 py-3 rounded-2xl text-sm font-black border-2 border-main shadow-sm hover:border-primary/20 transition-colors">
                                    #{tag.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Reviews Section */}
                    <section className="pt-24 border-t border-main">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-3xl font-black flex items-center gap-4">
                                <MessageSquare className="text-primary" size={32} />
                                Community Intel
                            </h2>
                        </div>

                        {/* Post Review */}
                        {user ? (
                            <form onSubmit={submitReview} className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-10 mb-20 border-2 border-main shadow-inner">
                                <div className="flex items-center gap-6 mb-8">
                                    <span className="font-black text-lg">Rate Your Intel:</span>
                                    <StarRating
                                        rating={newReview.stars}
                                        interactive
                                        onRatingChange={(s) => setNewReview({ ...newReview, stars: s })}
                                        size={32}
                                    />
                                </div>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Share your experience with the community..."
                                    className="w-full px-8 py-6 bg-card border-2 border-main rounded-[2.5rem] focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none mb-6 font-medium text-lg lg:text-xl shadow-sm"
                                    value={newReview.text}
                                    onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                                />
                                <button
                                    disabled={reviewLoading}
                                    type="submit"
                                    className="btn-primary w-full md:w-auto"
                                >
                                    {reviewLoading ? 'Transmitting...' : 'Post Your Intel'}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-card rounded-[3rem] p-16 text-center mb-20 border-4 border-dashed border-main">
                                <p className="text-slate-500 font-black text-xl mb-6 uppercase tracking-widest">Signed In Intelligence Required</p>
                                <Link to="/sign-in" className="btn-primary">Connect Now</Link>
                            </div>
                        )}

                        {/* Review List */}
                        <div className="space-y-12">
                            {reviews.length > 0 ? (
                                reviews.map(review => (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        key={review.id}
                                        className="pb-12 border-b border-main group"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-secondary dark:bg-slate-800 flex items-center justify-center text-primary font-black text-xl shadow-lg">
                                                    {review.user_clerk_id.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <StarRating rating={review.stars} size={16} />
                                                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">
                                                        User ID: {review.user_clerk_id.substring(0, 8)} • {new Date(review.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic pl-4 border-l-4 border-main group-hover:border-primary transition-colors">
                                            "{review.text}"
                                        </p>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[3rem]">
                                    <p className="text-slate-400 font-black uppercase tracking-widest">No community data yet</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="relative">
                    <div className="bg-secondary dark:bg-slate-900 text-white rounded-[3rem] p-10 shadow-3xl sticky top-24 overflow-hidden group border dark:border-slate-800">
                        <div className="absolute top-0 right-0 w-full h-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <h3 className="text-2xl font-black mb-10 flex items-center gap-3">
                            <Sparkles className="text-orange-400" size={28} fill="currentColor" />
                            Elite Insight
                        </h3>

                        <div className="space-y-8 mb-12">
                            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Quality Score</span>
                                <span className="text-5xl font-black text-orange-400 leading-none">{Math.round(product.quality_score || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Visual Intel</span>
                                <span className="font-black text-xl">{product.views.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Endorsements</span>
                                <span className="font-black text-xl">{product.likes.length}</span>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <p className="text-sm text-slate-400 leading-relaxed font-bold italic">
                                "Our proprietary score blends peer reviews, engagement metrics, and verified visual intelligence."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
