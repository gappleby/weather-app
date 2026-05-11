'use client';
import { useState, useEffect } from "react";

export default function LocationDate({ timezone, country }) {
    const [date, setDate] = useState('');

    useEffect(() => {
        const fmt = new Intl.DateTimeFormat(`und-${country}`, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: timezone,
        });
        const tick = () => setDate(fmt.format(new Date()));
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, [timezone, country]);

    return (
        <div className="absolute top-4 left-6 text-white font-semibold text-xl xs:text-2xl sm:text-4xl md:text-5xl opacity-90">
            {date}
        </div>
    );
}
