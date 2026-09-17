import type { Metadata } from "next";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Review — Praxis",
  description: "Reflect on what you have learned, applied, and discovered.",
};

export default function ReviewPage() {
  return (
    <PageHeader
      title="Review"
      lede="Reflect on what you’ve learned, applied, and discovered."
    >
      <p>
        Your reflections and reviews will live here, so you can see what is
        actually changing over time.
      </p>
    </PageHeader>
  );
}
