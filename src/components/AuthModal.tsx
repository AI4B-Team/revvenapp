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
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Sign in to continue
          </h2>
          <p className="text-muted-foreground text-sm">
            Create an account or sign in to start creating content
          </p>
          
          <div className="flex flex-col w-full gap-3 pt-2">
            <Button onClick={handleSignIn} variant="outline" className="w-full">
              Sign In
            </Button>
            <Button onClick={handleSignUp} className="w-full">
              Sign up for free
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
