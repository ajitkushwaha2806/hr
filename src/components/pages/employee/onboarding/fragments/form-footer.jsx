"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/global/loader";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function FormFooter({
  activeStep,
  totalSteps = 4,
  isSubmitting = false,
  onBack,
  onNext,
}) {
  return (
    <div className="pt-6 sm:pt-8 border-t border-border/40 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
      {activeStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 px-5 rounded-md text-xs font-semibold gap-2 border-border/60 hover:bg-muted cursor-pointer w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="size-4" />
          <span>Previous Step</span>
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {activeStep < totalSteps ? (
        <Button
          type="button"
          onClick={onNext}
          className="h-11 px-8 rounded-md text-xs font-bold gap-2 shadow-sm bg-primary hover:bg-primary/90 text-white cursor-pointer w-full sm:w-auto justify-center"
        >
          <span>Proceed to Step 0{activeStep + 1}</span>
          <ArrowRight className="size-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-9 rounded-md text-xs font-bold gap-2 shadow-md bg-primary hover:bg-primary/90 text-white cursor-pointer w-full sm:w-auto justify-center"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="text-white" />
              <span>Finalizing Profile...</span>
            </>
          ) : (
            <>
              <span>Complete Onboarding</span>
              <CheckCircle2 className="size-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
