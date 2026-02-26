import { Link } from 'react-router-dom';
import { Eye, Heart, Zap, Tag } from 'lucide-react';
import type { Product } from '../types';
import { StarRating } from './StarRating';
import { motion } from 'framer-motion';

interface ProductCardProps {
    product: Product;
    averageRating: number;
}

export const ProductCard = ({ product, averageRating }: ProductCardProps) => {
    const heroImage = product.images_urls?.[0] || product.logo_url;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            <div className="relative aspect-[16/9] overflow-hidden">
                <Link to={`/products/${product.id}`} className="block w-full h-full">
                    <img
                        src={`${heroImage}?q_auto,f_auto,w_800`}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60" />
                </Link>

                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/20 ${product.pricing === 'Free' ? 'bg-green-500/90 text-white' :
                        product.pricing === 'Premium' ? 'bg-orange-500/90 text-white' :
                            'bg-indigo-600/90 text-white'
                        }`}>
                        {product.pricing}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                        <Tag size={10} />
                        {product.category}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0">
                        <img
                            src={`${product.logo_url}?q_auto,f_auto,w_100`}
                            alt={`${product.name} logo`}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm"
                        />
                    </div>
                    <Link to={`/products/${product.id}`} className="flex-grow">
                        <h3 className="font-extrabold text-xl leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 font-medium leading-normal flex-grow">
                    {product.description}
                </p>

                <div className="flex items-center justify-between py-4 border-y border-slate-50 dark:border-slate-800/50 mb-4">
                    <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Eye size={14} className="text-slate-400" />
                            {product.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Heart size={14} className={`${product.likes.length > 0 ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                            {product.likes.length}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-400/10 px-2.5 py-1.5 rounded-lg border border-orange-100/50 dark:border-orange-400/20">
                        <Zap size={12} fill="currentColor" />
                        QS: {Math.round(product.quality_score || 0)}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-500">
                        <StarRating rating={Math.round(averageRating)} size={14} />
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                        {averageRating.toFixed(1)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

