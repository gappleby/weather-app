import { useMemo } from "react";

const ROUTE_TYPE_LABEL = {
    0: 'Tram', 1: 'Metro', 2: 'Train', 3: 'Bus', 4: 'Ferry',
};

function minsAway(departureTime, rtDepartureTime, localTime) {
    const t = rtDepartureTime || departureTime;
    const [dh, dm] = t.split(':').map(Number);
    const [lh, lm] = localTime.split(':').map(Number);
    const diff = dh * 60 + dm - (lh * 60 + lm);
    if (diff < 0) return null;
    if (diff === 0) return 'Due';
    if (diff < 60) return `${diff} min`;
    return `${String(dh % 24).padStart(2, '0')}:${String(dm).padStart(2, '0')}`;
}

export default function DepartureBoard({ departureData, maxItems = 5 }) {
    const items = useMemo(() => {
        if (!departureData?.stopDepartures) return [];
        const localTime = departureData.localTime;
        const all = [];

        for (const stop of departureData.stopDepartures) {
            for (const dep of stop.departureList) {
                const rawTime = dep.rtDepartureTime || dep.departureTime;
                const [dh, dm] = rawTime.split(':').map(Number);
                const [lh, lm] = localTime.split(':').map(Number);
                const diffMins = dh * 60 + dm - (lh * 60 + lm);
                if (diffMins < 0) continue;

                all.push({
                    key: `${stop.stopId}-${dep.tripId}-${dep.departureTime}`,
                    routeShortName: dep.routeShortName,
                    headsign: dep.tripHeadsign,
                    stopName: stop.stopName,
                    typeLabel: ROUTE_TYPE_LABEL[Number(dep.routeType)] ?? '',
                    diffMins,
                    timeLabel: diffMins === 0 ? 'Due'
                        : diffMins < 60 ? `${diffMins} min`
                        : `${String(dh % 24).padStart(2, '0')}:${String(dm).padStart(2, '0')}`,
                    routeColor: dep.routeColor ? `#${dep.routeColor}` : '#444',
                    routeTextColor: dep.routeTextColor ? `#${dep.routeTextColor}` : '#fff',
                    isRealtime: !!dep.rtDepartureTime,
                });
            }
        }

        all.sort((a, b) => a.diffMins - b.diffMins);
        return all.slice(0, maxItems);
    }, [departureData, maxItems]);

    if (!items.length) return null;

    return (
        <div className="border-t border-white/30 pt-4 mt-2">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Next departures</p>
            <div className="flex flex-col gap-2">
                {items.map(item => (
                    <div key={item.key} className="flex items-center gap-2 sm:gap-3 text-left">
                        <span
                            className="text-xs font-bold px-2 py-0.5 rounded min-w-[2.5rem] text-center shrink-0"
                            style={{ backgroundColor: item.routeColor, color: item.routeTextColor }}
                        >
                            {item.routeShortName}
                        </span>
                        {item.typeLabel && (
                            <span className="text-xs opacity-50 shrink-0 hidden sm:inline">{item.typeLabel}</span>
                        )}
                        <span className="flex-1 text-sm sm:text-base truncate opacity-90">{item.headsign}</span>
                        <span className={`text-sm sm:text-base font-semibold tabular-nums shrink-0 ${item.isRealtime ? 'text-green-300' : ''}`}>
                            {item.timeLabel}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
