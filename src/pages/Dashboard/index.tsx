import { Overview } from "./Overview";
import { AssetList } from "./AssetList";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <Overview />
      <Separator />
      <AssetList />
    </div>
  );
}
