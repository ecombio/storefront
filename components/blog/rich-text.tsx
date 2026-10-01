import Link from "next/link";
import { Fragment, type ReactNode } from "react";

interface RichNode {
  bold?: boolean;
  children?: RichNode[];
  italic?: boolean;
  listType?: "ordered" | "unordered";
  type: string;
  url?: string;
  value?: string;
}

function renderNodes(nodes: RichNode[] = []): ReactNode[] {
  return nodes.map((node, i) => <Fragment key={i}>{renderNode(node)}</Fragment>);
}

function renderNode(node: RichNode): ReactNode {
  switch (node.type) {
    case "text": {
      let out: ReactNode = node.value;
      if (node.bold) out = <strong>{out}</strong>;
      if (node.italic) out = <em>{out}</em>;
      return out;
    }
    case "link": {
      const url = node.url ?? "";
      if (!url.startsWith("/") && !url.startsWith("https://")) return renderNodes(node.children);
      return (
        <Link
          className="text-foreground underline"
          href={url}
          {...(url.startsWith("https://") ? { rel: "noopener noreferrer", target: "_blank" } : {})}
        >
          {renderNodes(node.children)}
        </Link>
      );
    }
    case "paragraph":
      return <p>{renderNodes(node.children)}</p>;
    case "heading":
      return <p className="font-bold">{renderNodes(node.children)}</p>;
    case "list":
      return node.listType === "ordered" ? (
        <ol className="list-decimal pl-4">{renderNodes(node.children)}</ol>
      ) : (
        <ul className="list-disc pl-4">{renderNodes(node.children)}</ul>
      );
    case "list-item":
      return <li>{renderNodes(node.children)}</li>;
    default:
      return renderNodes(node.children);
  }
}

export function RichText({ value }: { value: string }) {
  let root: RichNode | undefined;
  try {
    root = JSON.parse(value) as RichNode;
  } catch {
    root = undefined;
  }
  if (!root) return <p>{value}</p>;
  return <div className="grid gap-4">{renderNodes(root.children)}</div>;
}
