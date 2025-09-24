'use client';

import { useAdaptiveImage } from "react-resilient-hooks";
import { useI18n } from '../../contexts/I18nProvider';

const imageSources = {
  low: "https://placehold.co/150",
  medium: "https://placehold.co/300",
  high: "https://placehold.co/600",
};

export function UseAdaptiveImageDemo() {
  const { t } = useI18n();
  const imageUrl = useAdaptiveImage(imageSources);

  return (
    <div className="mt-4 p-4  flex justify-center items-center min-h-[200px]">
      <img src={imageUrl} alt="Adaptive Image" className="max-w-full h-auto" />
      <p className="text-xs text-gray-500 mt-2 italic">
        {t.hooks.useAdaptiveImage.clarificationNote}
      </p>
    </div>
  );
}