import { SignUp } from '@clerk/clerk-react';
import { SEO } from '../components/SEO';

export const SignUpPage = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <SEO
                title="Join ProdSpark - Ignite Your Innovation Today"
                description="Create your ProdSpark account to submit tools, share reviews, and connect with the world's best creators."
                canonical="https://prodspark.vercel.app/sign-up"
            />
            <div className="w-full max-w-md">
                <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-primary hover:bg-orange-600 text-sm normal-case',
                            card: 'shadow-xl border border-slate-100 dark:border-slate-800 rounded-3xl',
                            headerTitle: 'text-2xl font-bold text-secondary dark:text-white',
                            headerSubtitle: 'text-slate-500 dark:text-slate-400',
                        }
                    }}
                />
            </div>
        </div>
    );
};
