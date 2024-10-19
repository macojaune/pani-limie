import { createLazyFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import aboutContent from "../content/mentions-legales.md";

export const Route = createLazyFileRoute("/mentions-legales")({
  component: LegalPage,
});

function LegalPage() {
  return (
    <div className="p-4 mb-8 mx-auto">
      <ReactMarkdown className="prose lg:prose-lg prose-slate lg:prose-p:my-2 ">
        {aboutContent}
      </ReactMarkdown>
    </div>
  );
}
