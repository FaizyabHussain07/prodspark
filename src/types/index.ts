export interface Product {
    id: string;
    owner_clerk_id: string;
    name: string;
    category: string;
    link: string;
    logo_url: string;
    description: string;
    tags: string[];
    pricing: 'Free' | 'Premium' | 'Paid';
    images_urls: string[];
    views: number;
    likes: string[]; // Array of user_clerk_ids
    created_at: string;
    // Computed fields
    quality_score?: number;
    averageRating?: number;
}

export interface Review {
    id: string;
    product_id: string;
    user_clerk_id: string;
    user_name?: string;
    user_avatar_url?: string;
    text: string;
    stars: number;
    created_at: string;
}

export const calculateQualityScore = (product: Product, averageRating: number): number => {
    return product.views + (product.likes.length * 2) + (averageRating * 10);
};
