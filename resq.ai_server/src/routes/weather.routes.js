// routes/weather.routes.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('--- Executing weather route handler ---');

  try {
    let { lat, lon } = req.query;

    // ✅ If no coordinates provided, try to resolve via IP
    if (!lat || !lon) {
      const clientIp =
        req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

      console.log('No coordinates provided. Resolving location from IP:', clientIp);

      const geoRes = await axios.get(
        `http://ip-api.com/json/${clientIp}?fields=lat,lon,city`
      );
      lat = geoRes.data.lat;
      lon = geoRes.data.lon;

      if (!lat || !lon) {
        return res.status(400).json({
          success: false,
          message: 'Could not resolve location from IP',
        });
      }

      console.log('Resolved coordinates from IP:', lat, lon);
    }

    // ✅ Fetch weather from OpenWeather
    const resp = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric',
      },
      timeout: 8000,
    });

    const data = resp.data;

    // ✅ Risk categorization logic
    const condition = (data.weather?.[0]?.main || '').toLowerCase();
    const temp = data.main?.temp;

    let risk = 'Low';
    if (
      condition.includes('storm') ||
      condition.includes('hurricane') ||
      condition.includes('tornado') ||
      condition.includes('cyclone')
    ) {
      risk = 'High';
    } else if (
      condition.includes('rain') ||
      condition.includes('snow') ||
      condition.includes('wind') ||
      (typeof temp === 'number' && (temp > 40 || temp < 5))
    ) {
      risk = 'Medium';
    }

    // ✅ Respond with structured data
    res.json({
      success: true,
      location: data.name,
      description: data.weather?.[0]?.description || '',
      main: data.weather?.[0]?.main || '',
      temperature: data.main?.temp,
      feels_like: data.main?.feels_like,
      humidity: data.main?.humidity,
      wind_speed: data.wind?.speed,
      risk,
      raw: data,
    });
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || error.message || 'Failed to fetch weather data';
    res.status(status).json({ success: false, message });
  }
});

export default router;
