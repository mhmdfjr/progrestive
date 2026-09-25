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
        className="aspect-4/3 w-full"
        src={imageUrl}
        alt={alt ?? caption}
        width={600}
        height={400}
        loading="lazy"
      />
      <figcaption className="border-t-2 text-main-foreground border-border p-4">
        {caption}
      </figcaption>
    </figure>
  );
}
