export async function POST(req) {
  try {
    const body = await req.json();
    const { responses, timestamp, id, lastSection, status } = body;

    if (id) {
      const updatedSurvey = await prisma.surveyHistory.update({
        where: { id: parseInt(id, 10) },
        data: {
          responses: JSON.stringify(responses),
          timestamp: new Date(timestamp),
          lastSection,
          status: status,
        },
      });

      return new Response(JSON.stringify(updatedSurvey), { status: 200 });
    } else {
      const newSurvey = await prisma.surveyHistory.create({
        data: {
          responses: JSON.stringify(responses),
          timestamp: new Date(timestamp),
          status: status || "In Progress",
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
