import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    keywords?: string;
    author?: string;
    canonical?: string;
}

export const SEO = ({
    title = "ProdSpark - Discover & Submit the Best Tools and Products",
    description = "ProdSpark is a free platform to discover, submit, and review the best tools, AI products, and side projects. Built for makers and builders.",
    image = "https://prodspark.vercel.app/OG-BANNER.png",
    url = "https://prodspark.vercel.app",
    type = "website",
    keywords = "ai, devtools, marketing, productivity, directory, makers, saas, products, tools",
    author = "ProdSpark Team",
    canonical = "https://prodspark.vercel.app",
}: SEOProps) => {
    const siteName = "ProdSpark";
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="robots" content="index, follow" />

            {/* Canonical */}
            <link rel="canonical" href={canonical || url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="en_US" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@prodspark" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Mobile & App */}
            <meta name="theme-color" content="#f97316" />
        </Helmet>
    );
};
