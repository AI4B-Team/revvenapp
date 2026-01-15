import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, UserPlus, LogIn } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/login');
  };

  const handleSignUp = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-violet-500/20 rounded-2xl blur-xl" />
              
              {/* Floating orbs */}
              <motion.div
                animate={{
                  x: [0, 15, 0],
                  y: [0, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400/40 to-cyan-400/40 rounded-full blur-2xl"
              />
              <motion.div
                animate={{
                  x: [0, -10, 0],
                  y: [0, 15, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-violet-400/40 to-pink-400/40 rounded-full blur-2xl"
              />

              {/* Main content */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.2)]">
                {/* Decorative top accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 rounded-b-full" />
                
                {/* Icon with glow */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>

                <div className="flex flex-col items-center text-center space-y-3">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent"
                  >
                    Sign In To Continue
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-500 text-sm"
                  >
                    Start free or sign in to view your result
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-col w-full gap-3 pt-5"
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={handleSignUp}
                        className="w-full relative overflow-hidden group bg-gradient-to-r from-emerald-500 via-emerald-500 to-cyan-500 hover:from-emerald-600 hover:via-emerald-600 hover:to-cyan-600 text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="relative flex items-center justify-center gap-2">
                          <UserPlus className="w-5 h-5" />
                          Sign Up For Free
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={handleSignIn} 
                        variant="outline" 
                        className="w-full group bg-white hover:bg-slate-50 text-slate-700 font-medium py-6 text-base border-2 border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-300"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <LogIn className="w-5 h-5" />
                          Login
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Trust indicators */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-4 pt-4 text-xs text-slate-400"
                  >
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Free to start
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      No credit card
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      Cancel anytime
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
