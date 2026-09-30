import { notFound, permanentRedirect } from "next/navigation";

const PLACEHOLDER_HANDLE = "__placeholder__";

export function generateStaticParams() {
  return [{ articleHandle: PLACEHOLDER_HANDLE, blogHandle: PLACEHOLDER_HANDLE }];
}

export default async function ArticleRedirectPage({
  params,
}: PageProps<"/blogs/[blogHandle]/[articleHandle]">) {
  const { articleHandle, blogHandle } = await params;
  if (blogHandle === PLACEHOLDER_HANDLE || articleHandle === PLACEHOLDER_HANDLE) notFound();
  permanentRedirect(`/blogs/articles/${articleHandle}`);
}
