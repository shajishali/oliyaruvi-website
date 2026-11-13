import type { ReactNode } from "react";
import { ContactFormBlock } from "../../components/blocks/ContactFormBlock";
import { CtaBlock } from "../../components/blocks/CtaBlock";
import { CustomLayoutBlock } from "../../components/blocks/CustomLayoutBlock";
import { FaqBlock } from "../../components/blocks/FaqBlock";
import { GalleryBlock } from "../../components/blocks/GalleryBlock";
import { HeroBlock } from "../../components/blocks/HeroBlock";
import { ImageBlock } from "../../components/blocks/ImageBlock";
import { ImageSliderBlock } from "../../components/blocks/ImageSliderBlock";
import { LiveEventsBlock } from "../../components/blocks/LiveEventsBlock";
import { ProductGridBlock } from "../../components/blocks/ProductGridBlock";
import { ServicesBlock } from "../../components/blocks/ServicesBlock";
import { StatisticsBlock } from "../../components/blocks/StatisticsBlock";
import { TestimonialsBlock } from "../../components/blocks/TestimonialsBlock";
import { TextBlock } from "../../components/blocks/TextBlock";
import { VideoGalleryBlock } from "../../components/blocks/VideoGalleryBlock";
import { VideoHeroBlock } from "../../components/blocks/VideoHeroBlock";
import type { BlockType } from "../types";
import { BLOCK_TYPES } from "./blocks";

export function isBlockType(value: string): value is BlockType {
  return BLOCK_TYPES.some((type) => type === value);
}

export function renderBlock(type: string, content: Record<string, unknown>): ReactNode {
  if (!isBlockType(type)) return null;
  switch (type) {
    case "hero":
      return <HeroBlock content={content} />;
    case "video_hero":
      return <VideoHeroBlock content={content} />;
    case "image_slider":
      return <ImageSliderBlock content={content} />;
    case "text":
      return <TextBlock content={content} />;
    case "image":
      return <ImageBlock content={content} />;
    case "gallery":
      return <GalleryBlock content={content} />;
    case "video_gallery":
      return <VideoGalleryBlock content={content} />;
    case "services":
      return <ServicesBlock content={content} />;
    case "product_grid":
      return <ProductGridBlock content={content} />;
    case "live_events":
      return <LiveEventsBlock content={content} />;
    case "testimonials":
      return <TestimonialsBlock content={content} />;
    case "statistics":
      return <StatisticsBlock content={content} />;
    case "faq":
      return <FaqBlock content={content} />;
    case "contact_form":
      return <ContactFormBlock content={content} />;
    case "cta":
      return <CtaBlock content={content} />;
    case "custom_layout":
      return <CustomLayoutBlock content={content} />;
    default:
      return null;
  }
}
