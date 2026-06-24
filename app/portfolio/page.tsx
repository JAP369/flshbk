import { PortfolioOverview } from "@/components/portfolio/PortfolioOverview";

export const metadata = {
  title: "Portfolio Overview | FlashBK",
  description: "Track your portfolio performance and valuation",
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <PortfolioOverview />
      </div>
    </div>
  );
}
