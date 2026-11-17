import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(
  cors({
    origin: FRONTEND_ORIGIN === "*" ? "*" : FRONTEND_ORIGIN,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json({ limit: "100kb" }));

/* =========================================================
   COUNTRIES
========================================================= */

const countries = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "TR", name: "Türkiye", flag: "🇹🇷" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
];

/* =========================================================
   DOMESTIC TOURS
========================================================= */

const domesticTours = {
  PK: [
    {
      id: "pk-hunza",
      title: "Hunza Valley Escape",
      countryCode: "PK",
      country: "Pakistan",
      category: "domestic",
      location: "Hunza, Gilgit-Baltistan",
      duration: "5 Days / 4 Nights",
      price: 699,
      currency: "USD",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=85",
      description:
        "Explore dramatic mountains, peaceful villages and the breathtaking landscapes of Hunza Valley.",
    },
    {
      id: "pk-skardu",
      title: "Skardu Mountain Adventure",
      countryCode: "PK",
      country: "Pakistan",
      category: "domestic",
      location: "Skardu, Gilgit-Baltistan",
      duration: "6 Days / 5 Nights",
      price: 799,
      currency: "USD",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1200&q=85",
      description:
        "Discover lakes, mountains, valleys and unforgettable Himalayan scenery in Skardu.",
    },
    {
      id: "pk-swat",
      title: "Swat Valley Retreat",
      countryCode: "PK",
      country: "Pakistan",
      category: "domestic",
      location: "Swat, Khyber Pakhtunkhwa",
      duration: "4 Days / 3 Nights",
      price: 499,
      currency: "USD",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1200&q=85",
      description:
        "Enjoy green valleys, rivers, mountain views and a relaxing escape in Swat.",
    },
  ],

  AE: [
    {
      id: "ae-dubai",
      title: "Dubai City Experience",
      countryCode: "AE",
      country: "United Arab Emirates",
      category: "domestic",
      location: "Dubai, UAE",
      duration: "4 Days / 3 Nights",
      price: 599,
      currency: "USD",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
      description:
        "Experience Dubai's iconic skyline, modern attractions, beaches and vibrant city life.",
    },
    {
      id: "ae-abu-dhabi",
      title: "Abu Dhabi Discovery",
      countryCode: "AE",
      country: "United Arab Emirates",
      category: "domestic",
      location: "Abu Dhabi, UAE",
      duration: "3 Days / 2 Nights",
      price: 499,
      currency: "USD",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=85",
      description:
        "Discover Abu Dhabi's architecture, cultural attractions and beautiful coastline.",
    },
    {
      id: "ae-ras-al-khaimah",
      title: "Ras Al Khaimah Escape",
      countryCode: "AE",
      country: "United Arab Emirates",
      category: "domestic",
      location: "Ras Al Khaimah, UAE",
      duration: "3 Days / 2 Nights",
      price: 449,
      currency: "USD",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85",
      description:
        "Combine beaches, mountains and adventure during a relaxing Ras Al Khaimah getaway.",
    },
  ],

  SA: [
    {
      id: "sa-riyadh",
      title: "Riyadh City Discovery",
      countryCode: "SA",
      country: "Saudi Arabia",
      category: "domestic",
      location: "Riyadh, Saudi Arabia",
      duration: "4 Days / 3 Nights",
      price: 549,
      currency: "USD",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=85",
      description:
        "Explore modern Riyadh, cultural attractions and the changing face of Saudi Arabia.",
    },
    {
      id: "sa-alula",
      title: "AlUla Heritage Journey",
      countryCode: "SA",
      country: "Saudi Arabia",
      category: "domestic",
      location: "AlUla, Saudi Arabia",
      duration: "4 Days / 3 Nights",
      price: 699,
      currency: "USD",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=85",
      description:
        "Journey through remarkable desert landscapes and ancient heritage sites in AlUla.",
    },
    {
      id: "sa-jeddah",
      title: "Jeddah Coastal Escape",
      countryCode: "SA",
      country: "Saudi Arabia",
      category: "domestic",
      location: "Jeddah, Saudi Arabia",
      duration: "3 Days / 2 Nights",
      price: 499,
      currency: "USD",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85",
      description:
        "Enjoy Jeddah's Red Sea coastline, historic districts and lively atmosphere.",
    },
  ],

  GB: [
    {
      id: "gb-london",
      title: "London City Break",
      countryCode: "GB",
      country: "United Kingdom",
      category: "domestic",
      location: "London, England",
      duration: "4 Days / 3 Nights",
      price: 749,
      currency: "USD",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
      description:
        "Experience London's famous landmarks, museums, neighborhoods and city culture.",
    },
    {
      id: "gb-scotland",
      title: "Scottish Highlands",
      countryCode: "GB",
      country: "United Kingdom",
      category: "domestic",
      location: "Scottish Highlands, Scotland",
      duration: "6 Days / 5 Nights",
      price: 899,
      currency: "USD",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=1200&q=85",
      description:
        "Discover dramatic landscapes, lochs and historic scenery across the Scottish Highlands.",
    },
    {
      id: "gb-lake-district",
      title: "Lake District Retreat",
      countryCode: "GB",
      country: "United Kingdom",
      category: "domestic",
      location: "Lake District, England",
      duration: "4 Days / 3 Nights",
      price: 699,
      currency: "USD",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
      description:
        "Relax among lakes, mountains and peaceful countryside in England's Lake District.",
    },
  ],

  US: [
    {
      id: "us-new-york",
      title: "New York City Adventure",
      countryCode: "US",
      country: "United States",
      category: "domestic",
      location: "New York, USA",
      duration: "5 Days / 4 Nights",
      price: 999,
      currency: "USD",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=85",
      description:
        "Explore iconic neighborhoods, skyline views, parks and attractions across New York City.",
    },
    {
      id: "us-california",
      title: "California Road Escape",
      countryCode: "US",
      country: "United States",
      category: "domestic",
      location: "California, USA",
      duration: "7 Days / 6 Nights",
      price: 1199,
      currency: "USD",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
      description:
        "Enjoy California's coastline, cities and scenic landscapes on an unforgettable journey.",
    },
    {
      id: "us-grand-canyon",
      title: "Grand Canyon Adventure",
      countryCode: "US",
      country: "United States",
      category: "domestic",
      location: "Arizona, USA",
      duration: "4 Days / 3 Nights",
      price: 799,
      currency: "USD",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1200&q=85",
      description:
        "Experience one of America's most spectacular natural landscapes.",
    },
  ],
};

/* =========================================================
   GENERIC DOMESTIC TOURS
========================================================= */

const genericDomesticTemplates = [
  {
    suffix: "city",
    title: "City Discovery",
    duration: "4 Days / 3 Nights",
    price: 599,
    rating: 4.7,
  },
  {
    suffix: "nature",
    title: "Nature Escape",
    duration: "5 Days / 4 Nights",
    price: 699,
    rating: 4.8,
  },
  {
    suffix: "culture",
    title: "Culture & Heritage",
    duration: "4 Days / 3 Nights",
    price: 649,
    rating: 4.8,
  },
];

function getGenericDomesticTours(country) {
  const countryName = country.name;

  const destinations = [
    `${countryName} City`,
    `${countryName} Highlands`,
    `${countryName} Heritage Region`,
  ];

  return genericDomesticTemplates.map((template, index) => ({
    id: `${country.code}-generic-${template.suffix}`,
    title: `${countryName} ${template.title}`,
    countryCode: country.code,
    country: countryName,
    category: "domestic",
    location: destinations[index],
    duration: template.duration,
    price: template.price,
    currency: "USD",
    rating: template.rating,
    image:
      [
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
        "https://images.unsplash.com/photo-1500534623283-312aade485b7",
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
      ][index] +
      "?auto=format&fit=crop&w=1200&q=85",
    description: `Explore the highlights, landscapes and culture of ${countryName}.`,
  }));
}

/* =========================================================
   INTERNATIONAL TOURS
========================================================= */

const internationalTours = [
  {
    id: "intl-dubai",
    title: "Dubai Luxury Escape",
    countryCode: "AE",
    country: "United Arab Emirates",
    category: "international",
    location: "Dubai, UAE",
    duration: "5 Days / 4 Nights",
    price: 899,
    currency: "USD",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
    description:
      "Enjoy Dubai's skyline, luxury experiences, beaches and unforgettable attractions.",
  },
  {
    id: "intl-turkiye",
    title: "Türkiye Heritage Journey",
    countryCode: "TR",
    country: "Türkiye",
    category: "international",
    location: "Istanbul & Cappadocia",
    duration: "7 Days / 6 Nights",
    price: 999,
    currency: "USD",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=85",
    description:
      "Discover Istanbul's historic streets and the otherworldly landscapes of Cappadocia.",
  },
  {
    id: "intl-maldives",
    title: "Maldives Island Retreat",
    countryCode: "MV",
    country: "Maldives",
    category: "international",
    location: "Maldives",
    duration: "5 Days / 4 Nights",
    price: 1299,
    currency: "USD",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    description:
      "Relax on tropical islands with turquoise water, beaches and peaceful surroundings.",
  },
  {
    id: "intl-switzerland",
    title: "Swiss Alps Experience",
    countryCode: "CH",
    country: "Switzerland",
    category: "international",
    location: "Zurich & Swiss Alps",
    duration: "7 Days / 6 Nights",
    price: 1499,
    currency: "USD",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85",
    description:
      "Explore alpine scenery, charming towns and spectacular Swiss mountain landscapes.",
  },
  {
    id: "intl-thailand",
    title: "Thailand Tropical Adventure",
    countryCode: "TH",
    country: "Thailand",
    category: "international",
    location: "Bangkok & Phuket",
    duration: "7 Days / 6 Nights",
    price: 949,
    currency: "USD",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85",
    description:
      "Combine vibrant city life, tropical beaches and unforgettable Thai experiences.",
  },
  {
    id: "intl-bali",
    title: "Bali Island Journey",
    countryCode: "ID",
    country: "Indonesia",
    category: "international",
    location: "Bali, Indonesia",
    duration: "6 Days / 5 Nights",
    price: 899,
    currency: "USD",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
    description:
      "Discover Bali's beaches, temples, rice terraces and tropical landscapes.",
  },
];

/* =========================================================
   SUPABASE
========================================================= */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

/* =========================================================
   HELPERS
========================================================= */

function findCountry(code) {
  return countries.find(
    (country) => country.code === String(code || "").toUpperCase()
  );
}

function getDomesticTours(countryCode) {
  const country = findCountry(countryCode);

  if (!country) {
    return [];
  }

  return domesticTours[country.code] || getGenericDomesticTours(country);
}

function getToursForCountry(countryCode) {
  const code = String(countryCode || "US").toUpperCase();

  const domestic = getDomesticTours(code);

  const international = internationalTours.filter(
    (tour) => tour.countryCode !== code
  );

  return {
    domestic,
    international,
  };
}

function createBookingReference() {
  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `TV-${new Date().getFullYear()}-${randomPart}`;
}

function cleanString(value, maxLength = 200) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "TourVista API",
    database: Boolean(supabase),
  });
});

/* =========================================================
   COUNTRIES API
========================================================= */

app.get("/api/countries", (req, res) => {
  res.json({
    ok: true,
    countries,
  });
});

/* =========================================================
   LOCATION API
========================================================= */

app.get("/api/location", async (req, res) => {
  try {
    const response = await fetch("https://ipwho.is/");

    if (!response.ok) {
      throw new Error(`Location service returned ${response.status}`);
    }

    const data = await response.json();

    const countryCode = String(data.country_code || "US").toUpperCase();

    const country = findCountry(countryCode);

    res.json({
      ok: true,
      countryCode: country ? country.code : "US",
      country: country ? country.name : "United States",
      flag: country ? country.flag : "🇺🇸",
      source: "ip",
    });
  } catch (error) {
    console.error("Location detection failed:", error.message);

    res.json({
      ok: true,
      countryCode: "US",
      country: "United States",
      flag: "🇺🇸",
      source: "fallback",
    });
  }
});

/* =========================================================
   TOURS API
========================================================= */

app.get("/api/tours", (req, res) => {
  const countryCode = String(req.query.country || "US").toUpperCase();

  const country = findCountry(countryCode);

  if (!country) {
    return res.status(400).json({
      ok: false,
      message: "Unsupported country code.",
    });
  }

  const tours = getToursForCountry(country.code);

  res.json({
    ok: true,
    country,
    domestic: tours.domestic,
    international: tours.international,
    counts: {
      domestic: tours.domestic.length,
      international: tours.international.length,
      total: tours.domestic.length + tours.international.length,
    },
  });
});

/* =========================================================
   BOOKINGS API
========================================================= */

app.post("/api/bookings", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        ok: false,
        message:
          "Booking database is not configured. Please configure Supabase first.",
      });
    }

    const name = cleanString(req.body.name, 100);
    const email = cleanString(req.body.email, 160).toLowerCase();
    const phone = cleanString(req.body.phone, 40);
    const travelDate = cleanString(req.body.travelDate, 20);
    const countryCode = cleanString(req.body.countryCode, 5).toUpperCase();
    const tourId = cleanString(req.body.tourId, 100);

    const guests = Number(req.body.guests);

    if (!name || name.length < 2) {
      return res.status(400).json({
        ok: false,
        message: "Please provide a valid name.",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        ok: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!phone || phone.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Please provide a valid phone number.",
      });
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > 50) {
      return res.status(400).json({
        ok: false,
        message: "Guests must be between 1 and 50.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
      return res.status(400).json({
        ok: false,
        message: "Please provide a valid travel date.",
      });
    }

    const selectedDate = new Date(`${travelDate}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate <= today) {
      return res.status(400).json({
        ok: false,
        message: "Travel date must be in the future.",
      });
    }

    const country = findCountry(countryCode);

    if (!country) {
      return res.status(400).json({
        ok: false,
        message: "Unsupported country.",
      });
    }

    const tourCatalog = getToursForCountry(country.code);

    const allTours = [
      ...tourCatalog.domestic,
      ...tourCatalog.international,
    ];

    const tour = allTours.find((item) => item.id === tourId);

    if (!tour) {
      return res.status(400).json({
        ok: false,
        message: "Selected tour was not found.",
      });
    }

    const reference = createBookingReference();

    const { error } = await supabase
      .from("tourvista_bookings")
      .insert({
        reference,
        tour_id: tour.id,
        customer_name: name,
        email,
        phone,
        travel_date: travelDate,
        guests,
        country_code: country.code,
        status: "pending",
      });

    if (error) {
      console.error("Supabase booking error:", error);

      return res.status(500).json({
        ok: false,
        message: "Booking could not be saved.",
      });
    }

    return res.status(201).json({
      ok: true,
      message: "Booking request received successfully.",
      booking: {
        reference,
        status: "pending",
        tour: {
          id: tour.id,
          title: tour.title,
          location: tour.location,
        },
        travelDate,
        guests,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);

    return res.status(500).json({
      ok: false,
      message: "Something went wrong while creating the booking.",
    });
  }
});

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "API route not found.",
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    ok: false,
    message: "Internal server error.",
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log("");
  console.log("==========================================");
  console.log("       TourVista API is running");
  console.log("==========================================");
  console.log(`Local API: http://localhost:${PORT}`);
  console.log(`Database configured: ${Boolean(supabase)}`);
  console.log("==========================================");
  console.log("");
});