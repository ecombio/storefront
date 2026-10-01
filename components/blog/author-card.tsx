import Image from "next/image";
import Link from "next/link";

import { AuthorBadge } from "@/components/blog/author-badge";
import { RichText } from "@/components/blog/rich-text";
import type { AuthorProfile } from "@/lib/blog/types";

export function AuthorCard({ profile }: { profile: AuthorProfile }) {
  return (
    <div className="flex items-start gap-5 border-t pt-8">
      {profile.photo && (
        <div className="relative size-20 shrink-0">
          <div className="relative size-full overflow-hidden rounded-full bg-muted">
            <Image
              alt={profile.photo.altText}
              className="object-cover"
              fill
              sizes="80px"
              src={profile.photo.url}
            />
          </div>
          <AuthorBadge className="absolute bottom-0 left-1/2 size-6 -translate-x-1/2 translate-y-1/3 rounded-full" />
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
          <div className="line-clamp-2 text-muted-foreground text-sm leading-6">
            <RichText value={profile.bio} />
          </div>
        )}
      </div>
    </div>
  );
}
