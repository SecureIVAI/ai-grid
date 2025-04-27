import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { timestamp } = await req.json();

    const newSurvey = await prisma.surveyHistory.create({
      data: {
        responses: JSON.stringify({}),
        timestamp: new Date(timestamp),
        status: "In Progress",
        lastSection: "context",
      },
    });
    console.log("New survey created with ID:", newSurvey.id);

    return new Response(JSON.stringify({ id: newSurvey.id }), { status: 200 });
  } catch (error) {
    console.error("Error starting new survey:", error);
    return new Response(JSON.stringify({ error: "Failed to start survey." }), { status: 500 });
  }
}
