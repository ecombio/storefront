import Image from "next/image";
import Link from "next/link";

import type { AuthorProfile } from "@/lib/blog/types";

export function AuthorCard({ profile }: { profile: AuthorProfile }) {
  return (
    <div className="flex items-start gap-5 border-t pt-8">
      {profile.photo && (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image
            alt={profile.photo.altText}
            className="object-cover"
            fill
            sizes="80px"
            src={profile.photo.url}
          />
        </div>
      )}
      <div className="grid min-w-0 gap-1">
        <p className="font-medium text-sm">
          {profile.handle ? (
            <Link className="hover:underline" href={`/blogs/author/${profile.handle}`}>
              {profile.name}
            </Link>
          ) : (
            profile.name
          )}
        </p>
        {profile.role && <p className="text-muted-foreground text-sm">{profile.role}</p>}
        {profile.bio && (
          <p className="line-clamp-2 text-muted-foreground text-sm leading-6">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
