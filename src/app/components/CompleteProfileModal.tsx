import { AlertCircle } from "lucide-react";
import { GradientButton } from "./ui/gradient-button";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteProfile: () => void;
}

export function CompleteProfileModal({ isOpen, onClose, onCompleteProfile }: CompleteProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-2xl p-6 mx-6 max-w-sm w-full border border-border shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-accent" />
          </div>
          
          <h2 className="text-xl mb-2">Complete Your Profile</h2>
          
          <p className="text-sm text-muted-foreground mb-6">
            Complete your profile before applying for a loan.
          </p>

          <div className="w-full space-y-3">
            <GradientButton
              onClick={onCompleteProfile}
              className="w-full"
            >
              Complete Profile
            </GradientButton>

            <button
              onClick={onClose}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
