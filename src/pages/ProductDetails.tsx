import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
    Heart, ExternalLink, ArrowLeft, MessageSquare,
    Info, Loader2, Sparkles, Zap, Layers, Share2, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase, createClerkSupabaseClient } from '../supabaseClient';
import { calculateQualityScore } from '../types';
import type { Product, Review } from '../types';
import { StarRating } from '../components/StarRating';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { SchemaOrg } from '../components/SchemaOrg';
import {
    TwitterShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    WhatsappShareButton,
    XIcon,
    FacebookIcon,
    LinkedinIcon,
    WhatsappIcon,
} from 'react-share';

export const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const { getToken } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [newReview, setNewReview] = useState({ text: '', stars: 5 });
    const [copied, setCopied] = useState(false);

    const shareUrl = window.location.href;
    const shareTitle = product ? `${product.name} on ProdSpark: ${product.description.substring(0, 60)}...` : 'Check out this cool tool on ProdSpark!';

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
                quality_score: calculateQualityScore(productData, avgRating),
                averageRating: avgRating
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
            const token = await getToken();
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
            const token = await getToken();
            if (!token) throw new Error('Auth token missing');
            const authenticatedSupabase = createClerkSupabaseClient(token);

            const { data, error } = await authenticatedSupabase.from('reviews').insert({
                product_id: id,
                user_clerk_id: user.id,
                user_name: user.fullName || user.username || 'Anonymous',
                user_avatar_url: user.imageUrl,
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
        "image": product.images_urls?.[0] || product.logo_url,
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
            <SEO
                title={`${product.name} - Discover & Review the Best AI Tools | ProdSpark`}
                description={product.description.length > 152 ? `${product.description.substring(0, 152)}...` : product.description}
                image={product.images_urls?.[0] || product.logo_url}
                url={`https://prodspark.vercel.app/products/${id}`}
                type="product"
                canonical={`https://prodspark.vercel.app/products/${id}`}
            />
            <SchemaOrg data={productSchema} />

            {/* Top Navigation Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/products" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm uppercase tracking-wider">
                        <ArrowLeft size={18} />
                        Back to Catalog
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">QUALITY SCORE:</span>
                            <span className="text-lg font-black text-primary">{Math.round(product.quality_score || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative flex-shrink-0"
                        >
                            <img
                                src={`${product.logo_url}?q_auto,f_auto,w_400`}
                                alt={product.name}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover shadow-xl border-4 border-white dark:border-slate-800"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-xl shadow-lg">
                                <Zap size={16} fill="currentColor" />
                            </div>
                        </motion.div>

                        <div className="flex-grow">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {product.name}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.pricing === 'Free' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                                    product.pricing === 'Premium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                                        'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                    }`}>
                                    {product.pricing}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <StarRating rating={Math.round(avgRating)} size={16} />
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{avgRating.toFixed(1)}</span>
                                    <span className="text-slate-400 text-xs font-medium">({reviews.length} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500">
                                    <Layers size={14} />
                                    {product.category || 'General'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLike}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black transition-all border-2 ${product.likes.includes(user?.id || '')
                                    ? 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-500'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-red-500 hover:text-red-500'
                                    }`}
                            >
                                <Heart size={20} className={product.likes.includes(user?.id || '') ? 'fill-current' : ''} />
                                {product.likes.length}
                            </motion.button>
                            <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 px-8 py-4 rounded-2xl"
                            >
                                Visit Experience
                                <ExternalLink size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Featured Image */}
                        {(product.images_urls || []).length > 0 && (
                            <section className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                <img
                                    src={`${product.images_urls[0]}?q_auto,f_auto,w_1200`}
                                    alt={`${product.name} Main Preview`}
                                    className="w-full aspect-video object-cover"
                                />
                            </section>
                        )}

                        {/* Description */}
                        <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-500">
                                    <Info size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Discovery Journey</h2>
                            </div>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal whitespace-pre-wrap">
                                {product.description}
                            </p>

                            <div className="mt-8 flex flex-wrap gap-2">
                                {(product.tags || []).map(tag => (
                                    <span key={tag} className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-bold text-slate-500">
                                        #{tag.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Gallery */}
                        {(product.images_urls || []).length > 0 && (
                            <section className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white px-2">Visual Intel</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {product.images_urls.map((url, i) => (
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            key={i}
                                            className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg"
                                        >
                                            <img
                                                src={`${url}?q_auto,f_auto,w_800`}
                                                alt={`Preview ${i + 1}`}
                                                loading="lazy"
                                                className="w-full aspect-[4/3] object-cover"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Reviews */}
                        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-8 px-2">
                                <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                                    <MessageSquare className="text-primary" size={24} />
                                    Community Intel
                                </h2>
                            </div>

                            {user ? (
                                <form onSubmit={submitReview} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 mb-12 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="font-bold">Rate:</span>
                                        <StarRating
                                            rating={newReview.stars}
                                            interactive
                                            onRatingChange={(s) => setNewReview({ ...newReview, stars: s })}
                                            size={24}
                                        />
                                    </div>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Launch your intelligence here... (English/Urdu mix works best!)"
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none transition-all resize-none mb-4 font-medium"
                                        value={newReview.text}
                                        onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                                    />
                                    <button
                                        disabled={reviewLoading}
                                        type="submit"
                                        className="btn-primary w-full md:w-auto px-10 py-3 rounded-xl font-black"
                                    >
                                        {reviewLoading ? 'Transmitting...' : 'Post Intel Now'}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center mb-12">
                                    <p className="text-slate-500 font-bold mb-4">You need to be signed in to post Intel.</p>
                                    <Link to="/sign-in" className="btn-primary inline-block px-8 py-3 rounded-xl">Sign In</Link>
                                </div>
                            )}

                            <div className="space-y-6">
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            key={review.id}
                                            className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={review.user_avatar_url || `https://ui-avatars.com/api/?name=${review.user_name || 'U'}&background=random`}
                                                        alt={review.user_name || 'User'}
                                                        className="w-10 h-10 rounded-xl object-cover shadow-sm bg-primary/10"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                                                {review.user_name || 'Anonymous User'}
                                                            </span>
                                                            <StarRating rating={review.stars} size={10} />
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                            {new Date(review.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                {review.text}
                                            </p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-400 font-bold italic">Waiting for community intel...</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8 sticky top-24">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative group">
                            <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-slate-900 dark:text-white">
                                <Sparkles className="text-orange-400" size={20} fill="currentColor" />
                                Elite Insight
                            </h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Quality Score</span>
                                    <span className="text-3xl font-black text-primary">{Math.round(product.quality_score || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Visual Intel</span>
                                    <span className="font-black text-slate-900 dark:text-white">{product.views.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                                <Share2 className="text-primary" size={20} />
                                Share this Tool
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                <TwitterShareButton url={shareUrl} title={shareTitle}>
                                    <XIcon size={40} round />
                                </TwitterShareButton>
                                <FacebookShareButton url={shareUrl}>
                                    <FacebookIcon size={40} round />
                                </FacebookShareButton>
                                <LinkedinShareButton url={shareUrl} title={shareTitle}>
                                    <LinkedinIcon size={40} round />
                                </LinkedinShareButton>
                                <WhatsappShareButton url={shareUrl} title={shareTitle}>
                                    <WhatsappIcon size={40} round />
                                </WhatsappShareButton>
                            </div>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                    setCopied(true);
                                    toast.success('Link copied to clipboard!');
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className={`w-full mt-6 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${copied
                                    ? 'bg-green-500 border-green-500 text-white shadow-lg'
                                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 border-slate-100 dark:border-slate-700'
                                    }`}
                            >
                                {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Share2 size={12} /> Copy Link</>}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
