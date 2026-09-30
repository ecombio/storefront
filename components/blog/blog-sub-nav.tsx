import Link from "next/link";

export interface BlogSubNavProps {
  active: string;
  blogs: { handle: string; title: string }[];
}

export function BlogSubNav({ active, blogs }: BlogSubNavProps) {
  return (
    <nav aria-label="Blog categories" className="flex gap-6 overflow-x-auto border-b pb-3 text-sm">
      {blogs.map((blog) => (
        <Link
          aria-current={blog.handle === active ? "page" : undefined}
          className={
            blog.handle === active
              ? "whitespace-nowrap font-medium text-foreground"
              : "whitespace-nowrap text-muted-foreground hover:text-foreground"
          }
          href={`/blogs/category/${blog.handle}`}
          key={blog.handle}
        >
          {blog.title}
        </Link>
      ))}
    </nav>
  );
}
