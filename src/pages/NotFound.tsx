import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Home, Search, ArrowLeft, Zap, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAnimated, setIsAnimated] = useState(false);
  const [glitchText, setGlitchText] = useState("404");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setIsAnimated(true);
    
    // Glitch effect for 404 text
    const glitchChars = ['4', '0', '4', '█', '▓', '▒', '░'];
    const glitchInterval = setInterval(() => {
      const randomText = Array.from({length: 3}, () => 
        glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join('');
      setGlitchText(randomText);
      
      setTimeout(() => setGlitchText("404"), 100);
    }, 2000);

    return () => clearInterval(glitchInterval);
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const suggestedPages = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Interns", path: "/interns", icon: Search },
    { name: "Tasks", path: "/tasks", icon: Zap },
    { name: "Certificates", path: "/certificates", icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      <div className={`relative z-10 max-w-2xl mx-auto text-center transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Main 404 Display */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 select-none">
              {glitchText}
            </h1>
            <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-blue-600/20 dark:text-blue-400/20 blur-sm animate-pulse">
              404
            </div>
          </div>
          
          <Badge variant="destructive" className="mb-4 px-4 py-2 text-sm font-medium animate-bounce">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Page Not Found
          </Badge>
        </div>

        {/* Error Message Card */}
        <Card className="p-8 mb-8 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
              Oops! This page seems to have vanished
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              The page you're looking for doesn't exist or has been moved to a different location.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Requested path:</span>
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">
                {location.pathname}
              </code>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            onClick={handleGoBack}
            size="lg" 
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            size="lg" 
            variant="outline"
            className="group border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Home Page
          </Button>
        </div>

        <Separator className="my-8 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

        {/* Suggested Pages */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Maybe you were looking for:
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {suggestedPages.map((page, index) => {
              const Icon = page.icon;
              return (
                <Button
                  key={page.path}
                  variant="ghost"
                  onClick={() => navigate(page.path)}
                  className={`group h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-lg transition-all duration-300 transform hover:scale-105 ${isAnimated ? 'animate-fade-in-up' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {page.name}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-xs text-slate-400 dark:text-slate-500">
          <p>If you believe this is an error, please contact the administrator.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
