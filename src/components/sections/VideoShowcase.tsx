"use client";

import { OutlineFrame } from "@/components/ui/OutlineFrame";
import { Eyebrow } from "@/components/ui/Section";

type VideoContent = {
  eyebrow: string;
  title: string;
  body: string;
  src: string;
  poster: string;
};

/**
 * Self-hosted event clip, treated like any other media asset (file lives in
 * `public/videos/`, path set in `home.video` in content.ts). It's a short
 * celebration clip, so it plays as a silent, looping "living photo": autoplay
 * + muted + loop (browsers only allow autoplay when muted). Native controls
 * let a visitor pause or unmute. Swaps to a Payload media field later without
 * touching this component.
 */
export function VideoShowcase({ video }: { video: VideoContent }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-10">
      <div className="max-w-3xl space-y-4 text-center">
        <Eyebrow className="text-yellow">{video.eyebrow}</Eyebrow>
        <h2 className="text-3xl font-semibold md:text-4xl">{video.title}</h2>
        <p className="text-lg leading-relaxed text-dust">{video.body}</p>
      </div>

      <OutlineFrame color="yellow" className="w-full">
        <video
          className="aspect-video w-full bg-purple object-cover"
          src={video.src}
          poster={video.poster}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={video.title}
        />
      </OutlineFrame>
    </div>
  );
}
