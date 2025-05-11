import prisma from "@/lib/prisma"; 
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";


export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Find the logged-in user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }


    // Fetch only that user's survey history
    const surveys = await prisma.surveyHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify({ surveys }), { status: 200 });
  } catch (error) {
    console.error("Error fetching survey history:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch survey history." }), { status: 500 });
  }
}
