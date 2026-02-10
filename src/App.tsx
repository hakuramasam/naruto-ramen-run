import { useConvexAuth } from 'convex/react';
import { AuthScreen } from './components/AuthScreen';
import { Game3D } from './components/Game3D';
import { GameUI } from './components/GameUI';

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"></div>
            <div className="absolute inset-2 sm:inset-3 rounded-full border-4 border-transparent border-t-yellow-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 animate-pulse">
            LOADING...
          </h1>
          <p className="text-gray-400 mt-2 sm:mt-3 font-body text-xs sm:text-sm">Preparing your ninja training</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Game3D />
      <GameUI />
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-2 sm:py-3 text-center bg-black/30 backdrop-blur-sm z-50">
      <p className="text-gray-500 text-[10px] sm:text-xs font-body">
        Requested by <a href="https://twitter.com/HakuramaSam" target="_blank" rel="noopener noreferrer" className="text-orange-400/70 hover:text-orange-400 transition-colors">@HakuramaSam</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="text-purple-400/70 hover:text-purple-400 transition-colors">@clonkbot</a>
      </p>
    </footer>
  );
}
