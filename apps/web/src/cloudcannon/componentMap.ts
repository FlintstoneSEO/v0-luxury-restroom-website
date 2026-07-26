import CtaSection from '../components/sections/CtaSection.astro';
import FeatureGridSection from '../components/sections/FeatureGridSection.astro';
import HeroSection from '../components/sections/HeroSection.astro';
import FaqListSection from '../components/sections/FaqListSection.astro';
import InlineFaqsSection from '../components/sections/InlineFaqsSection.astro';
import EditorialSectionsSection from '../components/sections/EditorialSectionsSection.astro';
import LinkGridSection from '../components/sections/LinkGridSection.astro';
import ProcessSection from '../components/sections/ProcessSection.astro';
import RequirementsSection from '../components/sections/RequirementsSection.astro';
import TextSection from '../components/sections/TextSection.astro';

export const componentMap = {
  hero: HeroSection,
  text_section: TextSection,
  feature_grid: FeatureGridSection,
  requirements: RequirementsSection,
  process: ProcessSection,
  cta: CtaSection,
  faq_list: FaqListSection,
  inline_faqs: InlineFaqsSection,
  editorial_sections: EditorialSectionsSection,
  link_grid: LinkGridSection,
} as const;

export type ComponentType = keyof typeof componentMap;
