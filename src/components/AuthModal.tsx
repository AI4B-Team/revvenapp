import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
      <DialogContent className="sm:max-w-xl p-8">
        <div className="flex flex-col items-center text-center space-y-5 py-4">
          <h2 className="text-2xl font-bold text-slate-900 whitespace-nowrap">
            Sign In To Continue
          </h2>
          <p className="text-slate-500 text-base whitespace-nowrap">
            Start Free Or Sign In To View Your Result
          </p>
          
          <div className="flex flex-col w-full gap-3 pt-4">
            <Button 
              onClick={handleSignUp} 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 text-base rounded-full"
            >
              Sign Up For Free
            </Button>
            <Button 
              onClick={handleSignIn} 
              variant="outline" 
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 text-base border-slate-200 rounded-full"
            >
              Login
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
