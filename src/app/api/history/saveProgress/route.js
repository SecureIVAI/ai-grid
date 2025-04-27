import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { responses, timestamp, id, lastSection } = body;

    if (id) {
      // Attempt to update the existing survey
      const updatedSurvey = await prisma.surveyHistory.update({
        where: { id },
        data: {
          responses: JSON.stringify(responses),
          timestamp: new Date(timestamp),
          lastSection,
          status: "In Progress",
        },
      });
  
      return new Response(JSON.stringify(updatedSurvey), { status: 200 });
    } else {
      // Create new survey record
      const newSurvey = await prisma.surveyHistory.create({
        data: {
          responses: JSON.stringify(responses),
          timestamp: new Date(timestamp),
          status: "In Progress",
          lastSection: lastSection || null,
        },
      });

      return new Response(JSON.stringify(newSurvey), { status: 200 });
    }
  } catch (error) {
    console.error("Error saving progress:", error);
    return new Response(JSON.stringify({ error: "Failed to save progress." }), { status: 500 });
  }
}
