import prisma from "@/lib/prisma"; // Ensure this points to your Prisma setup
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 


export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    // Fetch all survey records from the database
    const surveys = await prisma.surveyHistory.findMany({
      orderBy: { createdAt: "desc" }, // Example: Order by creation date
    });

    return new Response(JSON.stringify({ surveys }), { status: 200 });
  } 
  catch (error) {
    console.error("Error fetching survey history:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch survey history." }), { status: 500 });
  }
}
