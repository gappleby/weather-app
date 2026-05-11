'use client';
import { useState, useEffect } from "react";

export default function LocationClock({ utcOffsetSeconds }) {
    const [time, setTime] = useState('');

    useEffect(() => {
        const tick = () => {
            const cityNow = new Date(Date.now() + utcOffsetSeconds * 1000);
            const h = String(cityNow.getUTCHours()).padStart(2, '0');
            const m = String(cityNow.getUTCMinutes()).padStart(2, '0');
            setTime(`${h}:${m}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [utcOffsetSeconds]);

    return (
        <div className="absolute top-4 right-6 text-white font-semibold text-xl xs:text-2xl sm:text-4xl md:text-5xl opacity-90 tabular-nums">
            {time}
        </div>
    );
}
