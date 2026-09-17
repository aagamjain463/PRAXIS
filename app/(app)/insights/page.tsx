import type { Metadata } from "next";
import { PageHeader } from "../../../components/page-header";

export const metadata: Metadata = {
  title: "Insights — Praxis",
  description: "The knowledge that matters to you will live here.",
};

export default function InsightsPage() {
  return (
    <PageHeader
      title="Insights"
      lede="The knowledge that matters to you will live here."
    >
      <p>
        Ideas, lessons, and highlights you capture will appear here, organized
        and ready to revisit when they matter most.
      </p>
    </PageHeader>
  );
}
