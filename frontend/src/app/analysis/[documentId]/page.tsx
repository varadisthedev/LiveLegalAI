import { AppShell } from "@/components/layout/app-shell";
import { DocumentAnalysisView } from "@/features/documents/components/document-analysis-view";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  return (
    <AppShell>
      <DocumentAnalysisView documentId={documentId} />
    </AppShell>
  );
}
