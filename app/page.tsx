import ElevatorNav from "@/components/ElevatorNav";
import Hero from "@/components/Hero";
import Building from "@/components/Building";
import Explorer from "@/components/Explorer";
import Interiors from "@/components/Interiors";
import Amenities from "@/components/Amenities";
import Location from "@/components/Location";
import Pricing from "@/components/Pricing";
import Progress from "@/components/Progress";
import Faq from "@/components/Faq";
import Visit from "@/components/Visit";
import Footer from "@/components/Footer";
import { SelectionProvider } from "@/lib/selection";

export default function Home() {
  return (
    <SelectionProvider>
      <ElevatorNav />
      <main>
        <Hero />
        <Building />
        <Explorer />
        <Interiors />
        <Amenities />
        <Location />
        <Pricing />
        <Progress />
        <Faq />
        <Visit />
      </main>
      <Footer />
    </SelectionProvider>
  );
}
