import { Link } from 'react-router-dom';
import {
    ArrowRight, Sparkles, TrendingUp, Zap, ChevronRight,
    ShieldCheck, Cpu, Globe, Layers, BarChart3, Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { calculateQualityScore } from '../types';
import type { Product } from '../types';
import { supabase } from '../supabaseClient';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { SchemaOrg } from '../components/SchemaOrg';

export const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .limit(10);

            if (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
                return;
            }

            const { data: reviews } = await supabase.from('reviews').select('product_id, stars');

            const productsWithScores = (products || []).map((p) => {
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

            const top4 = productsWithScores
                .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
                .slice(0, 4);

            setFeaturedProducts(top4);
            setLoading(false);
        };

        fetchFeatured();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const features = [
        {
            icon: <ShieldCheck className="text-primary" />,
            title: "Verified Curation",
            desc: "Every product is manually vetted for quality, innovation, and reliability."
        },
        {
            icon: <Cpu className="text-blue-500" />,
            title: "Intelligence First",
            desc: "Proprietary quality scores based on real-world utility and user feedback."
        },
        {
            icon: <Globe className="text-green-500" />,
            title: "Global Reach",
            desc: "Connect with creators and products from every corner of the digital world."
        }
    ];

    const stats = [
        { label: "Elite Tools", value: "2.5k+" },
        { label: "Active Makers", value: "12k+" },
        { label: "Reviews Shared", value: "45k+" },
        { label: "Sparks Ignited", value: "1.2M" }
    ];

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ProdSpark",
        "url": "https://prodspark.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://prodspark.com/products?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ProdSpark",
        "url": "https://prodspark.com",
        "logo": "https://prodspark.com/logo-icon.png",
        "sameAs": [
            "https://twitter.com/prodspark",
            "https://github.com/prodspark"
        ]
    };

    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title="ProdSpark - Discover & Submit the Best Tools and Products"
                description="ProdSpark is a free platform to discover, submit, and review the best tools, AI products, and side projects. Built for makers and builders."
                canonical="https://prodspark.vercel.app"
            />
            <SchemaOrg data={websiteSchema} />
            <SchemaOrg data={organizationSchema} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-40 overflow-hidden">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            x: [-100, 100, -100],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-100/40 dark:bg-orange-500/10 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            rotate: [0, -90, 0],
                            x: [100, -100, 100],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 dark:bg-indigo-500/10 rounded-full blur-[100px]"
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-primary border border-orange-100 dark:border-orange-500/20 px-5 py-2 rounded-full text-sm font-black mb-10 shadow-sm"
                    >
                        <Sparkles size={16} fill="currentColor" />
                        <span className="uppercase tracking-widest text-[11px]">Next Generation Directory</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95]"
                    >
                        Spark Your Ideas – <br />
                        <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                            Discover Excellence.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 mb-14 leading-relaxed font-medium"
                    >
                        ProdSpark is where world-class creators showcase their tools.
                        Join the elite community of makers shaping the future.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link to="/products" className="btn-primary flex items-center gap-3 group relative overflow-hidden">
                            <span className="relative z-10 flex items-center gap-3">
                                Explore The Catalog
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link to="/submit" className="btn-secondary flex items-center gap-3 group">
                            Submit Your Product
                            <Zap size={20} className="text-primary group-hover:scale-110 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Stats Section */}
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={stat.label}
                                className="text-center"
                            >
                                <div className="text-3xl md:text-4xl font-black text-main mb-1">{stat.value}</div>
                                <div className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 border-y border-main relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Built for Creators</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto text-lg">
                            We don't just list products. We ignite conversations and validate innovation through a rigorous platform built for the elite.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feature, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={feature.title}
                                className="bg-card border border-main p-10 rounded-[2.5rem] shadow-sm hover:shadow-premium transition-all group"
                            >
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-8 border border-main group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-32 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 text-center md:text-left gap-8">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold mb-2">
                                <TrendingUp size={20} />
                                <span className="uppercase tracking-widest text-xs">Premium tools</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black">Featured Products</h2>
                        </div>
                        <Link to="/products" className="btn-secondary py-3 px-8 text-sm flex items-center gap-2">
                            View Full Directory <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-card rounded-[2rem] h-[400px] animate-pulse border border-main" />
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {featuredProducts.map((p) => (
                                <motion.div key={p.id} variants={itemVariants}>
                                    <ProductCard product={p} averageRating={p.averageRating || 0} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-24 bg-card rounded-[3rem] border border-dashed border-main">
                            <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">No sparks found yet.</p>
                            <Link to="/submit" className="text-primary font-black mt-4 block hover:underline">Submit yours now</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Curation Process / Benefits */}
            <section className="py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                        >
                            <h2 className="text-5xl font-black mb-8 leading-tight">Elevate Your Product to <span className="text-primary italic">Elite Status.</span></h2>
                            <div className="space-y-8">
                                {[
                                    { icon: <Layers size={21} />, title: "Quality Assurance", desc: "We review every submission for UX, performance, and actual utility." },
                                    { icon: <BarChart3 size={21} />, title: "Data Driven Insight", desc: "Interactive analytics and engagement metrics for every product listed." },
                                    { icon: <Users size={21} />, title: "Maker Community", desc: "Direct feedback from the industry's most respected creators." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="w-14 h-14 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary border border-main group-hover:border-primary/40 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black mb-2">{item.title}</h4>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
                            <div className="relative bg-card border-4 border-main rounded-[3rem] p-12 shadow-3xl">
                                <div className="space-y-6">
                                    <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="h-32 bg-orange-500/10 rounded-3xl border border-orange-500/20" />
                                        <div className="h-32 bg-indigo-500/10 rounded-3xl border border-indigo-500/20" />
                                    </div>
                                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};
