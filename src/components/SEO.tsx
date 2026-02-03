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
    title = "ProdSpark - Discover Elite Tools & Products 2026",
    description = "Connect with the world's most innovative tools and creators. ProdSpark is the premium directory for AI, DevTools, and more.",
    image = "https://prodspark.vercel.app/og-image.png",
    url = "https://prodspark.vercel.app",
    type = "website",
    keywords = "ai, devtools, marketing, productivity, directory, makers, saas",
    author = "ProdSpark Team",
    canonical,
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

            {/* Canonical */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Mobile & App */}
            <meta name="theme-color" content="#f97316" />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        </Helmet>
    );
};
