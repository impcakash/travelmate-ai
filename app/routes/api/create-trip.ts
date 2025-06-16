import { GoogleGenerativeAI } from "@google/generative-ai";
import { ID } from "appwrite";
import { type ActionFunctionArgs } from "react-router";
import { appwriteConfig, database } from "~/appwrite/client";
import { parseMarkdownToJson } from "~/lib/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const {
      country,
      numberOfDays,
      travelStyle,
      interests,
      budget,
      groupType,
      userId,
    } = await request.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY!;

    const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
    Budget: '${budget}'
    Interests: '${interests}'
    TravelStyle: '${travelStyle}'
    GroupType: '${groupType}'
    Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
    {
      "name": "...",
      "description": "...",
      "estimatedPrice": "...",
      "duration": ${numberOfDays},
      "budget": "${budget}",
      "travelStyle": "${travelStyle}",
      "country": "${country}",
      "interests": ${interests},
      "groupType": "${groupType}",
      "bestTimeToVisit": [...],
      "weatherInfo": [...],
      "location": {
        "city": "...",
        "coordinates": [...],
        "openStreetMap": "..."
      },
      "itinerary": [
        {
          "day": 1,
          "location": "...",
          "activities": [
            { "time": "...", "description": "..." }
          ]
        }
      ]
    }`;

    const textResult = await genAI
      .getGenerativeModel({ model: "gemini-1.5-flash-latest" })
      .generateContent([prompt]);

    const rawResponse = textResult.response.text();

    let trip;
    try {
      trip = parseMarkdownToJson(rawResponse);
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini response:", rawResponse);
      return new Response(
        JSON.stringify({ error: "Invalid AI response. Try again." }),
        { status: 500 }
      );
    }

    // ✅ Build safe query string
    const queryTerms = [country, interests, travelStyle]
      .filter(Boolean)
      .join(" ");
    const query = encodeURIComponent(queryTerms);

    console.log("🔍 Unsplash query string:", query);
    console.log(
      "🔗 Full URL:",
      `https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashApiKey}`
    );

    // 🔍 Fetch images from Unsplash
    const imageRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashApiKey}`
    );

    const imageJson = await imageRes.json();

    // 🚨 Check for API errors
    if (imageJson.errors) {
      console.error("❌ Unsplash API error:", imageJson.errors);
    }

    console.log("📸 Unsplash raw results:", imageJson.results);

    // ✅ Extract clean image URLs
    const imageUrls: string[] = Array.isArray(imageJson.results)
      ? imageJson.results
          .slice(0, 3)
          .map((r: any) => r?.urls?.regular || null)
          .filter((url: string | null): url is string => url !== null)
      : [];

    console.log("✅ Final imageUrls:", imageUrls);

    // 💾 Save to Appwrite
    const doc = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      ID.unique(),
      {
        tripDetail: JSON.stringify(trip),
        createdAt: new Date().toISOString(),
        imageUrls,
        userId,
      }
    );

    return new Response(JSON.stringify({ id: doc.$id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("🚨 Error generating travel plan:", error);
    return new Response(
      JSON.stringify({ error: "Server error while generating trip." }),
      { status: 500 }
    );
  }
};
