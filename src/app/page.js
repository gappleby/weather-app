import { Suspense } from "react";
import WeatherApp from "./components/WeatherApp";

export default function Home() {
  return (
    <main className="h-screen w-screen p-3">
      <Suspense>
        <WeatherApp />
      </Suspense>
    </main>
  );
}
