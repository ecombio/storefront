import { notFound, permanentRedirect } from "next/navigation";

const PLACEHOLDER_HANDLE = "__placeholder__";

export function generateStaticParams() {
  return [{ blogHandle: PLACEHOLDER_HANDLE }];
}

export default async function BlogRedirectPage({ params }: PageProps<"/blogs/[blogHandle]">) {
  const { blogHandle } = await params;
  if (blogHandle === PLACEHOLDER_HANDLE) notFound();
  permanentRedirect(`/blogs/category/${blogHandle}`);
}
