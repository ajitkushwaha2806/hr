"use client";
import { useRouter } from "next/navigation";
import Loader from "@/components/global/loader";
import { useState, useEffect, useRef } from "react";
import { useOnboarding } from "@/store/hooks/useOnboarding";
import useNotification from "@/store/hooks/useNotification";
import { STEPS, DRAFT_STORAGE_KEY_PREFIX } from "./constants";
import { NOTIFICATION_MESSAGES } from "@/constants/notification";
import { useClerk, useOrganization, useUser } from "@clerk/nextjs";
import { getInitialFormData, buildOnboardingPayload, validateStep } from "./helpers";
import { OnboardingHeader, FormFooter, Step1Personal, Step2Role, Step3Addresses, Step4Documents } from "./fragments";

export default function EmployeeOnboarding() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { organization } = useOrganization();
  const notify = useNotification();
  const { user, isOnboarded, isLoading, isSubmitting, submitOnboarding } = useOnboarding();

  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState(() => getInitialFormData(clerkUser, user));
  const [prevUserKey, setPrevUserKey] = useState("");

  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const draftLoadedRef = useRef(false);
  const isSubmittedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userKey = clerkUser?.id ? `${DRAFT_STORAGE_KEY_PREFIX}_${clerkUser.id}` : null;
    let savedRaw = null;
    if (userKey) {
      savedRaw = localStorage.getItem(userKey);
    }
    if (!savedRaw) {
      savedRaw = localStorage.getItem(DRAFT_STORAGE_KEY_PREFIX);
    }

    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw);
        if (parsed && typeof parsed === "object") {
          setTimeout(() => {
            if (parsed.formData && typeof parsed.formData === "object") {
              setFormData((prev) => ({
                ...prev,
                ...parsed.formData,
              }));
            }
            if (
              typeof parsed.activeStep === "number" &&
              parsed.activeStep >= 1 &&
              parsed.activeStep <= STEPS.length
            ) {
              setActiveStep(parsed.activeStep);
            }
            setIsDraftLoaded(true);
            draftLoadedRef.current = true;
          }, 0);
          return;
        }
      } catch (err) {
        console.error("Failed to restore onboarding draft:", err);
      }
    }

    setTimeout(() => {
      setIsDraftLoaded(true);
      draftLoadedRef.current = true;
    }, 0);
  }, [clerkUser?.id]);

  useEffect(() => {
    if (!isDraftLoaded || !draftLoadedRef.current || isSubmittedRef.current) return;
    if (typeof window === "undefined") return;

    const storageKey = clerkUser?.id
      ? `${DRAFT_STORAGE_KEY_PREFIX}_${clerkUser.id}`
      : DRAFT_STORAGE_KEY_PREFIX;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            formData,
            activeStep,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.error("Failed to save onboarding draft to localStorage:", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [formData, activeStep, isDraftLoaded, clerkUser?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      if (!draftLoadedRef.current || isSubmittedRef.current) return;
      const storageKey = clerkUser?.id
        ? `${DRAFT_STORAGE_KEY_PREFIX}_${clerkUser.id}`
        : DRAFT_STORAGE_KEY_PREFIX;
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            formData,
            activeStep,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData, activeStep, clerkUser?.id]);

  useEffect(() => {
    if (isOnboarded && !isEditing && typeof window !== "undefined") {
      try {
        if (clerkUser?.id) {
          localStorage.removeItem(`${DRAFT_STORAGE_KEY_PREFIX}_${clerkUser.id}`);
        }
        localStorage.removeItem(DRAFT_STORAGE_KEY_PREFIX);
      } catch {
      }
    }
  }, [isOnboarded, clerkUser?.id]);

  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || "";
  const clerkPhone = clerkUser?.primaryPhoneNumber?.phoneNumber || clerkUser?.phoneNumbers?.[0]?.phoneNumber || "";
  const clerkName = `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim();
  const currentUserKey = `${clerkUser?.id || ""}_${clerkEmail}_${clerkPhone}_${clerkName}_${user?.id || ""}`;

  if (currentUserKey && currentUserKey !== prevUserKey) {
    setPrevUserKey(currentUserKey);
    setFormData((prev) => {
      const initial = getInitialFormData(clerkUser, user);
      return {
        ...initial,
        firstName: prev.firstName || initial.firstName,
        lastName: prev.lastName || initial.lastName,
        email: initial.email || prev.email,
        phone: prev.phone || initial.phone,
        gender: (prev.gender && prev.gender !== "Prefer not to say" && prev.gender !== "Other") ? prev.gender : initial.gender,
        dateOfBirth: prev.dateOfBirth || initial.dateOfBirth,
        joiningDate: prev.joiningDate || initial.joiningDate,
        department: prev.department || initial.department,
        designation: prev.designation || initial.designation,
        employmentType: prev.employmentType || initial.employmentType,
        workLocation: prev.workLocation || initial.workLocation,

        currentStreet: prev.currentStreet || initial.currentStreet,
        currentCity: prev.currentCity || initial.currentCity,
        currentState: prev.currentState || initial.currentState,
        currentPostalCode: prev.currentPostalCode || initial.currentPostalCode,
        currentCountry: prev.currentCountry || initial.currentCountry,

        sameAsCurrentAddress: prev.sameAsCurrentAddress !== undefined ? prev.sameAsCurrentAddress : initial.sameAsCurrentAddress,
        permanentStreet: prev.permanentStreet || initial.permanentStreet,
        permanentCity: prev.permanentCity || initial.permanentCity,
        permanentState: prev.permanentState || initial.permanentState,
        permanentPostalCode: prev.permanentPostalCode || initial.permanentPostalCode,
        permanentCountry: prev.permanentCountry || initial.permanentCountry,

        emergencyName: prev.emergencyName || initial.emergencyName,
        emergencyRelation: prev.emergencyRelation || initial.emergencyRelation,
        emergencyPhone: prev.emergencyPhone || initial.emergencyPhone,

        aadharNumber: prev.aadharNumber || initial.aadharNumber,
        aadharFrontUrl: prev.aadharFrontUrl || initial.aadharFrontUrl,
        aadharBackUrl: prev.aadharBackUrl || initial.aadharBackUrl,
        panNumber: prev.panNumber || initial.panNumber,
        panFileUrl: prev.panFileUrl || initial.panFileUrl,

        accountHolderName: prev.accountHolderName || initial.accountHolderName,
        bankName: prev.bankName || initial.bankName,
        accountNumber: prev.accountNumber || initial.accountNumber,
        ifscCode: prev.ifscCode || initial.ifscCode,
        branchName: prev.branchName || initial.branchName,
        upiId: prev.upiId || initial.upiId,
      };
    });
  }

  const [errors, setErrors] = useState({});

  // Clear errors whenever activeStep changes so landing on a new step never shows premature errors
  useEffect(() => {
    setErrors({});
  }, [activeStep]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNext = () => {
    const errs = validateStep(activeStep, formData);
    if (Object.keys(errs).length === 0) {
      setErrors({});
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length));
    } else {
      setErrors(errs);
      notify.warning(NOTIFICATION_MESSAGES.ONBOARDING.STEP_VALIDATION_ERROR);
    }
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If user presses Enter while on steps 1-3, advance to next step instead of prematurely validating step 4
    if (activeStep < STEPS.length) {
      handleNext();
      return;
    }

    for (let step = 1; step <= STEPS.length; step++) {
      const errs = validateStep(step, formData);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setActiveStep(step);
        notify.warning(NOTIFICATION_MESSAGES.ONBOARDING.VALIDATION_ERROR);
        return;
      }
    }


    try {
      const payload = buildOnboardingPayload(formData);
      isSubmittedRef.current = true;
      await submitOnboarding(payload);

      if (typeof window !== "undefined") {
        try {
          if (clerkUser?.id) {
            localStorage.removeItem(`${DRAFT_STORAGE_KEY_PREFIX}_${clerkUser.id}`);
          }
          localStorage.removeItem(DRAFT_STORAGE_KEY_PREFIX);
        } catch (err) {
          console.error("Failed to clear onboarding draft from localStorage:", err);
        }
      }
      router.push("/employee/dashboard");
    } catch {
      isSubmittedRef.current = false;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  useEffect(() => {
    if (isOnboarded) {
      router.replace("/employee/dashboard");
    }
  }, [isOnboarded, router]);

  if (isLoading || isOnboarded) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/60 dark:bg-zinc-950 flex flex-col">
      <OnboardingHeader
        organization={organization}
        user={user}
        isOnboarded={isOnboarded}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 w-full px-3 sm:px-2 lg:px-6 py-3 sm:py-3 flex flex-col">
        <div className="w-full bg-white dark:bg-zinc-900 p-2 sm:p-4 lg:p-8 rounded-md border border-border/50 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            {activeStep === 1 && (
              <Step1Personal
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}

            {activeStep === 2 && (
              <Step2Role
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}

            {activeStep === 3 && (
              <Step3Addresses
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}

            {activeStep === 4 && (
              <Step4Documents
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}

            <FormFooter
              activeStep={activeStep}
              totalSteps={STEPS.length}
              isSubmitting={isSubmitting}
              onBack={handleBack}
              onNext={handleNext}
            />
          </form>
        </div>
      </main>
    </div>
  );
}
