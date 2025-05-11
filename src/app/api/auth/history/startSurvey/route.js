import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";


export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const { timestamp } = await req.json();

    const newSurvey = await prisma.surveyHistory.create({
      data: {
        responses: JSON.stringify({}),
        timestamp: new Date(timestamp),
        status: "In Progress",
        lastSection: "context",
        userId: session.user.id,
      },
    });
    console.log("New survey created with ID:", newSurvey.id);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `${session.user.name || "Unknown"} Started a new survey with ID ${newSurvey.id}`,
      }
    });

    return new Response(JSON.stringify({ id: newSurvey.id }), { status: 200 });
  } catch (error) {
    console.error("Error starting new survey:", error);
    return new Response(JSON.stringify({ error: "Failed to start survey." }), { status: 500 });
  }
}
