import Image from "next/image";

export default function ForecastStrip({ forecasts, tempUnit }) {
    return (
        <div className="border-t border-white/30 pt-4 mt-2">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Next 6 hours</p>
            <div className="flex justify-around">
                {forecasts.map((item) => (
                    <div key={item.dt} className="flex flex-col items-center gap-1">
                        <span className="text-sm sm:text-base opacity-75">{item.time}</span>
                        <Image src={item.icon} alt={item.description} width={40} height={40} className="sm:w-12 sm:h-12" />
                        <span className="font-semibold sm:text-lg">{item.temp}{tempUnit}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
