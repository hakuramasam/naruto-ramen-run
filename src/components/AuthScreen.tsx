import { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn('password', formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn('anonymous');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue as guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 mb-2 sm:mb-3 leading-tight tracking-tight">
            NARUTO
          </h1>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-orange-300 mb-3 sm:mb-4">
            RAMEN RUN
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm font-body">
            Dodge obstacles. Reach Ichiraku. Become Hokage.
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-black/40 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-5 sm:p-8 shadow-2xl shadow-orange-500/10">
          <h3 className="font-display text-lg sm:text-xl text-white mb-5 sm:mb-6 text-center">
            {flow === 'signIn' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-orange-300 mb-2 font-body">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-white/5 border border-orange-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-body text-sm sm:text-base"
                placeholder="ninja@konoha.village"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-orange-300 mb-2 font-body">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-white/5 border border-orange-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-body text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-xs sm:text-sm font-body">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-display text-base sm:text-lg rounded-xl hover:from-orange-400 hover:to-yellow-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
            >
              {isLoading ? 'LOADING...' : flow === 'signIn' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <button
              type="button"
              onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}
              className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-body transition-colors"
            >
              {flow === 'signIn' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 sm:px-4 bg-transparent text-gray-400 text-xs sm:text-sm font-body">or</span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="w-full py-3 sm:py-4 bg-white/5 border border-gray-600 text-gray-300 font-display text-sm sm:text-base rounded-xl hover:bg-white/10 hover:border-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CONTINUE AS GUEST
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-6 sm:mt-8 flex justify-center gap-3 sm:gap-4">
          {['🍥', '🍜', '⚡'].map((emoji, i) => (
            <span
              key={i}
              className="text-xl sm:text-2xl animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
