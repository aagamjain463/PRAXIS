import type { Metadata } from "next";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Actions — Praxis",
  description: "Turn useful knowledge into things you will actually do.",
};

export default function ActionsPage() {
  return (
    <PageHeader
      title="Actions"
      lede="Turn useful knowledge into things you’ll actually do."
    >
      <p>
        The actions you commit to will live here, so the gap between knowing
        and doing stays visible.
      </p>
    </PageHeader>
  );
}
