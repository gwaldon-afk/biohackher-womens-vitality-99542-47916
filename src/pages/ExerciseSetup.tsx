import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExerciseSetupWizardPage } from "@/components/exercise/ExerciseSetupWizardPage";

export default function ExerciseSetup() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/today');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
        <ExerciseSetupWizardPage onComplete={handleComplete} onBack={handleBack} />
      </main>
    </div>
  );
}
