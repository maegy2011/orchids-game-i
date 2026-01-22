import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "photos"; // "photos" or "videos"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      console.error("PEXELS_API_KEY is not defined in environment variables");
      return NextResponse.json({ 
        error: "Missing API Key", 
        message: "Please set PEXELS_API_KEY in the environment variables." 
      }, { status: 500 });
    }

  try {
    const endpoint = type === "videos" 
      ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1`
      : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || "Failed to fetch from Pexels" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from Pexels:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
