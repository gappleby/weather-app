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
- **Auto-refresh** every hour — current conditions and forecast update automatically.
- Full-screen layout with a thin black border — suitable for always-on or kiosk displays.
- Responsive design with Tailwind CSS, including fluid typography that scales down on narrow screens.
- Query string parameters to pre-set city, units, API key, and visibility of clock, date, and forecast — no search bar shown in kiosk mode.
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
   - Create a `.env.local` file in the root directory and add your API key:
     ```
     NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
     ```

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

All parameters are optional and can be combined freely. When a `city` parameter is present the search bar is hidden, making the app suitable for always-on or embedded displays.

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `city` | any city name | `melbourne,au` | City to display on load. Hides the search bar. Append a country code (e.g. `,us`) to resolve ambiguous names. |
| `units` | `metric` \| `imperial` | `metric` | `metric` → °C / m/s · `imperial` → °F / mph |
| `openweathermapapi` | API key string | *(env var)* | Overrides the `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY` environment variable. Falls back to the env var when absent. **Note:** keys in query strings are visible in browser history and server logs — only use this on private/controlled deployments. |
| `showtime` | `true` \| `T` \| `Y` \| `false` \| `F` \| `N` | `true` | Show or hide the live clock in the top-right corner. |
| `showdate` | `true` \| `T` \| `Y` \| `false` \| `F` \| `N` | `true` | Show or hide the date in the top-left corner. |
| `showforecast` | `true` \| `T` \| `Y` \| `false` \| `F` \| `N` | `true` | Show or hide the 6-hour hourly forecast strip. |

**Examples:**

```
# London in metric (default)
http://localhost:3000/?city=london,gb

# New York in imperial, no search bar
http://localhost:3000/?city=new+york,us&units=imperial

# Tokyo in Fahrenheit
http://localhost:3000/?city=tokyo,jp&units=imperial

# Minimal kiosk — no clock, no date, no forecast
http://localhost:3000/?city=singapore,sg&showtime=F&showdate=F&showforecast=F

# Hide the forecast strip only
http://localhost:3000/?city=dubai,ae&showforecast=false

# Override the API key via URL
http://localhost:3000/?city=paris,fr&openweathermapapi=your_key_here

# Conditions only, imperial, custom key
http://localhost:3000/?city=chicago,us&units=imperial&showforecast=N&openweathermapapi=your_key_here
```

## Components

- **WeatherApp.jsx**: Root component — manages all state, orchestrates API fetches, and composes the layout.
- **Search.jsx**: City search input and button. Hidden when the `?city=` query string parameter is present.
- **Card.jsx**: Reusable tile used in three modes — current temperature, humidity, and wind speed.
- **ForecastStrip.jsx**: Horizontal strip of hourly forecast cards for the next 6 hours.
- **LocationClock.jsx**: Live clock (top right) showing the current time at the queried city, updating every second.
- **LocationDate.jsx**: Live date (top left) in the regional format of the city's country, updating every minute.

## API Integration

The app uses two APIs. On each load (and every hour thereafter) both are fetched automatically.

### OpenWeatherMap — current conditions

Requires an API key (see Installation).

- **Endpoint:** `https://api.openweathermap.org/data/2.5/weather`
- **Parameters:** `q` (city name), `appid` (API key), `units` (`metric` or `imperial`)
- **Used for:** temperature, humidity, wind speed, weather condition icon, city coordinates, country code.

### Open-Meteo — hourly forecast

Free, no API key required. City coordinates from the OpenWeatherMap response are passed directly.

- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Parameters:** `latitude`, `longitude`, `hourly=temperature_2m,weathercode`, `forecast_days=2`, `timezone=auto`, `temperature_unit`
- **Used for:** next 6 hours of temperature and WMO weather code, plus the UTC offset and IANA timezone used by the clock and date display.

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
  --build-arg NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_key_here \
  -t weather-app .

# Run
docker run -p 3000:3000 weather-app
```

Or with Docker Compose (reads the key from your shell environment or a `.env` file):

```bash
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_key_here docker compose up --build
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
