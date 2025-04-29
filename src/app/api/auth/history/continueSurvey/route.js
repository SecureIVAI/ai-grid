import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 


export async function GET(req) {

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id"), 10); 

  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "Survey ID must be a number" }), { status: 400 });
  }

  try {
    console.log("Querying survey with ID:", id);
    const survey = await prisma.surveyHistory.findUnique({
      where: { id },
    });

    if (!survey) {
      return new Response(JSON.stringify({ error: "Survey not found" }), { status: 404 });
    }

    
    return new Response(
      JSON.stringify({
        ...survey,
        responses: JSON.parse(survey.responses), 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error continuing survey:", error);
    return new Response(JSON.stringify({ error: "Failed to load survey data." }), { status: 500 });
  }
}
