# Weather App

> **Fork of [aryansoni-git/weather-app](https://github.com/aryansoni-git/weather-app)** — extended with hourly forecasts, location clock and date, auto-refresh, Docker support, and query string configuration.
> This fork is available at **[gappleby/weather-app](https://github.com/gappleby/weather-app)**.

A modern, responsive weather application built using **Next.js 14** and **Tailwind CSS**. This app provides real-time weather data for any city worldwide, utilizing the **OpenWeatherMap API** for current conditions and **Open-Meteo** for hourly forecasts. It is designed to fill the screen and works well as an always-on or kiosk display.

## Demo

![cover](/public/cover.png)

You can try the game live [here](https://github.com/aryansoni-git/weather-app/)!

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
- [API Integration](#api-integration)
- [Technologies Used](#technologies-used)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time current conditions: temperature, humidity, wind speed, and a dynamic weather icon.
- **6-hour hourly forecast strip** powered by Open-Meteo (no API key required) — true 1-hour intervals.
- **Live location clock** (top right) showing the current time at the queried city, updating every second.
- **Live location date** (top left) in the regional date format of the city's country, updating every minute.
- **Next public transport departures** (train, tram, bus, ferry) via BusMaps — refreshes every 15 minutes.
- **Auto-refresh** every hour — current conditions and forecast update automatically.
- Full-screen layout with a thin black border — suitable for always-on or kiosk displays.
- Responsive design with Tailwind CSS, including fluid typography that scales down on narrow screens.
- Query string parameters to pre-set city, coordinates, units, API keys, and visibility of all sections — no search bar shown in kiosk mode.
- Error handling for invalid city names or network issues.

## Getting Started

To get a local copy of this project up and running, follow these steps.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn (package manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gappleby/weather-app.git
   cd weather-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Get an API key from OpenWeatherMap:**
   - Visit [OpenWeatherMap](https://openweathermap.org/api) and sign up to get your API key.

4. **Set up environment variables:**
   - Create a `.env.local` file in the root directory:
     ```
     NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_owm_key_here
     NEXT_PUBLIC_BUSMAPS_API_KEY=your_busmaps_key_here
     ```
   - OpenWeatherMap keys are available on the free tier at [openweathermap.org/api](https://openweathermap.org/api).
   - BusMaps keys must be requested via the [BusMaps developer portal](https://busmaps.com/en/developers/access). The BusMaps key is only required when `showdepartures=true`.

5. **Run the application:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Visit the app in your browser:**
   - Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

### Search bar

1. Enter the name of the city in the search bar.
2. Click the "Search" button.
3. The app will fetch and display the current weather data, including temperature, humidity, wind speed, and the corresponding weather icon.

### Query string parameters

All parameters are optional and can be combined freely. When a `city` or `lat`/`lon` parameter is present the search bar is hidden, making the app suitable for always-on or embedded displays.

#### Location

| Parameter | Default | Description |
|-----------|---------|-------------|
| `city` | `melbourne,au` | City name for weather lookup (e.g. `london,gb`, `new+york,us`). Append a country code to resolve ambiguous names. Hides the search bar when set. |
| `lat` | — | Latitude. When provided together with `lon`, all three APIs (OpenWeatherMap, Open-Meteo, BusMaps) use this exact coordinate. Recommended over `city` for kiosk/display precision. Hides the search bar. |
| `lon` | — | Longitude. Must be provided together with `lat`. |

When `lat`/`lon` are set, OpenWeatherMap resolves and displays the nearest city name automatically. The `city` parameter is still used as a fallback label if desired.

#### Display

| Parameter | Default | Description |
|-----------|---------|-------------|
| `units` | `metric` | `metric` → °C / m/s · `imperial` → °F / mph |
| `showdate` | `true` | Show or hide the date in the top-left corner. |
| `showtime` | `true` | Show or hide the live clock in the top-right corner. |
| `showforecast` | `true` | Show or hide the 6-hour hourly forecast strip. |
| `showdepartures` | `false` | Show or hide the next departures board. Requires a BusMaps API key. **Off by default.** |

Accepted false values for show* params: `false`, `f`, `n`. Any other value is treated as true — except `showdepartures` which requires explicit opt-in.

#### API key overrides

| Parameter | Description |
|-----------|-------------|
| `openweathermapapi` | Overrides `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY`. **Note:** keys in URLs are visible in browser history — only use on private/controlled deployments. |
| `busmapsapi` | Overrides `NEXT_PUBLIC_BUSMAPS_API_KEY`. Same caution applies. |

#### Departures (BusMaps)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `departurestopid` | — | BusMaps stop ID for a specific stop. Must be paired with `departureregion`. Takes priority over coordinate search. |
| `departureregion` | — | BusMaps region code (e.g. `aus_vic`, `usa_ny`, `gbr_sct`). Required with `departurestopid`. |
| `departurecount` | `5` | Number of departures to display. |
| `departureradius` | `500` | Radius in metres for coordinate-based stop search. Tighten this (e.g. `150`) to show only the nearest stop. |

Departures refresh every **15 minutes**. To find a stop's ID and region code, run this in the browser console:

```js
fetch('https://capi.busmaps.com:8443/stopsInRadius?location=LAT,LON&radius=300', {
  headers: { 'capi-key': 'Bearer YOUR_BUSMAPS_KEY', 'capi-host': 'busmaps.com' }
})
.then(r => r.json())
.then(d => console.table(
  d.stops.map(s => ({
    name: s.stopName,
    stopId: s.stopId,
    regionName: d.regionName,
    routes: s.routes?.map(r => r.routeShortName).join(', ')
  }))
))
```

> **Network note:** The BusMaps API runs on port **8443**. Ensure outbound TCP on 8443 is allowed on the display device's network.

### Examples

```
# London, metric
http://localhost:3000/?city=london,gb

# New York, imperial, no search bar
http://localhost:3000/?city=new+york,us&units=imperial

# Minimal kiosk — weather only, no clock/date/forecast
http://localhost:3000/?city=singapore,sg&showtime=F&showdate=F&showforecast=F
```

#### New York University — Washington Square

Weather and transit near NYU's main campus. Imperial units, covers nearby subway entrances and bus stops within 300 m.

```
http://localhost:3000/?city=new+york,us&lat=40.7316&lon=-74.0010&units=imperial&showdepartures=true&busmapsapi=YOUR_KEY&departureradius=300
```

```
https://gappleby.github.io/weather-app/?city=new+york,us&lat=40.7316&lon=-74.0010&units=imperial&showdepartures=true&departureradius=300
```

#### Malvern East — Train Station (Melbourne, Australia)

Next trains at Malvern station on the Glen Waverley line. Radius of 150 m keeps results to the station platform only.

```
http://localhost:3000/?city=melbourne,au&lat=-37.8663&lon=145.0293&showdepartures=true&busmapsapi=YOUR_KEY&departureradius=150
```

#### Ingliston Park & Ride — Edinburgh, Scotland

Tram and bus departures at the Ingliston Park & Ride near Edinburgh Airport.

```
http://localhost:3000/?city=edinburgh,gb&lat=55.9391&lon=-3.3551&showdepartures=true&busmapsapi=YOUR_KEY&departureradius=200
```

```
https://gappleby.github.io/weather-app/?city=edinburgh,gb&lat=55.9391&lon=-3.3551&showdepartures=true&departureradius=200
```

## Components

- **WeatherApp.jsx**: Root component — manages all state, orchestrates API fetches, and composes the layout.
- **Search.jsx**: City search input and button. Hidden when `?city=` or `?lat=`/`?lon=` are present.
- **Card.jsx**: Reusable tile used in three modes — current temperature, humidity, and wind speed.
- **ForecastStrip.jsx**: Horizontal strip of hourly forecast cards for the next 6 hours.
- **LocationClock.jsx**: Live clock (top right) showing the current time at the queried city, updating every second.
- **LocationDate.jsx**: Live date (top left) in the regional format of the city's country, updating every minute.
- **DepartureBoard.jsx**: Next departures list — shows a coloured route badge, destination (headsign), and minutes until departure. Real-time departures are highlighted in green; scheduled-only in white.

## API Integration

The app uses three APIs. Weather and forecast fetch on load and every 60 minutes. Departures fetch after the first weather load and then every 15 minutes independently.

### OpenWeatherMap — current conditions

Requires an API key (see Installation).

- **Endpoint:** `https://api.openweathermap.org/data/2.5/weather`
- **Parameters:** `q` (city name) **or** `lat`/`lon` (when `?lat=`/`?lon=` are set), `appid`, `units`
- **Used for:** temperature, humidity, wind speed, weather condition icon, city name, country code.

### Open-Meteo — hourly forecast

Free, no API key required. Uses `?lat=`/`?lon=` if provided, otherwise falls back to the coordinates returned by OpenWeatherMap.

- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Parameters:** `latitude`, `longitude`, `hourly=temperature_2m,weathercode`, `forecast_days=2`, `timezone=auto`, `temperature_unit`
- **Used for:** next 6 hours of temperature and WMO weather code, plus the UTC offset and IANA timezone used by the clock and date display.

### BusMaps — public transport departures

Requires a BusMaps API key. Only fetched when `showdepartures=true`.

- **Endpoint:** `https://capi.busmaps.com:8443/nextDepartures` (port 8443 — ensure it is open outbound)
- **Auth headers:** `capi-key: Bearer <key>`, `capi-host: busmaps.com`
- **Parameters:** `stopId` + `regionName` (specific stop) **or** `location` (lat,lon) + `radius` (metres)
- **Used for:** next departures including route number, destination, scheduled time, and real-time time if available.
- **Coordinate priority:** `?departurestopid=` → `?lat=`/`?lon=` → OpenWeatherMap coordinates.

## Technologies Used

- **Next.js 14**: React framework (App Router, client components).
- **Tailwind CSS**: Utility-first CSS with custom `xs` breakpoint and fluid spacing.
- **Axios**: Promise-based HTTP client for API requests.
- **OpenWeatherMap API**: Current weather conditions (API key required).
- **Open-Meteo API**: Hourly forecast data (free, no key required).
- **Intl.DateTimeFormat**: Native browser API used for regional date formatting.
- **JavaScript (ES6+)**: Core language.

## Best Practices

- **Environment Variables:** API key stored in `.env.local` and accessed via `NEXT_PUBLIC_` prefix — never hard-coded.
- **Dual API strategy:** OpenWeatherMap for current conditions (keyed), Open-Meteo for forecasts (free/keyless) — minimises API key usage.
- **Timezone-aware display:** Location clock and date use the IANA timezone from Open-Meteo and the country code from OpenWeatherMap to ensure correct local time and regional date format regardless of the viewer's location.
- **Component Reusability:** `Card` handles three display modes via props; `LocationClock` and `LocationDate` are self-contained with their own intervals and cleanup.
- **Error Handling:** User-friendly error messages for invalid city names or network failures.
- **Auto-refresh:** Weather and forecast refresh every hour via `setInterval` with cleanup on unmount.

## Docker

The app ships with a multi-stage Dockerfile that produces a minimal image using Next.js standalone output. The API key is baked in at build time (required because `NEXT_PUBLIC_` variables are inlined into the client bundle).

### Build and run locally

```bash
# Build
docker build \
  --build-arg NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_owm_key_here \
  --build-arg NEXT_PUBLIC_BUSMAPS_API_KEY=your_busmaps_key_here \
  -t weather-app .

# Run
docker run -p 3000:3000 weather-app
```

Or with Docker Compose (reads keys from your shell environment or a `.env` file):

```bash
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_owm_key_here \
NEXT_PUBLIC_BUSMAPS_API_KEY=your_busmaps_key_here \
docker compose up --build
```

### Deploy via GitHub (GitHub Container Registry)

The `.github/workflows/docker.yml` workflow builds and pushes the image to **GitHub Container Registry (GHCR)** automatically on every push to `main` and on every published release.

**One-time setup:**

1. In your GitHub repository go to **Settings → Secrets and variables → Actions**.
2. Add a secret named `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY` with your API key.
3. Push to `main` — the workflow runs and publishes the image to `ghcr.io/<owner>/<repo>:main`.

**Pull and run the published image:**

```bash
docker pull ghcr.io/<your-github-username>/<your-repo-name>:main
docker run -p 3000:3000 ghcr.io/<your-github-username>/<your-repo-name>:main
```

**Image tags produced:**

| Event | Tag |
|---|---|
| Push to `main` | `main` |
| Release `v1.2.3` | `1.2.3`, `1.2` |
| Any push | `sha-<short-sha>` |

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure your code follows the project's coding standards and is well-documented.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
