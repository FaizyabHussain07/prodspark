import { SignIn } from '@clerk/clerk-react';
import { SEO } from '../components/SEO';

export const SignInPage = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <SEO
                title="Sign In to ProdSpark - Access Your Dashboard"
                description="Sign in to your ProdSpark account to manage your products, track views, and engage with the community."
                canonical="https://prodspark.vercel.app/sign-in"
            />
            <div className="w-full max-w-md">
                <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
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
