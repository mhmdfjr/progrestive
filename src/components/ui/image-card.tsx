import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  imageUrl: string;
  caption: string;
  alt?: string;
  className?: string;
};

export default function ImageCard({ imageUrl, caption, alt, className }: Props) {
  return (
    <figure
      className={cn(
        "w-62.5 overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow",
        className,
      )}
    >
      <Image
        className="aspect-video w-full object-cover"
        src={imageUrl}
        alt={alt ?? caption}
        width={1920}
        height={1080}
        sizes="(max-width: 768px) 100vw, 400px"
        loading="lazy"
      />
      <figcaption className="border-t-2 text-main-foreground border-border p-4">
        {caption}
      </figcaption>
    </figure>
  );
}
