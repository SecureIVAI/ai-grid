import prisma from "@/lib/prisma";

export async function DELETE(req) {
  try {
    const body = await req.json(); 
    const id = body.id;

    if (!id) {
      return new Response(JSON.stringify({ error: "Survey ID is required" }), { status: 400 });
    }

    await prisma.surveyHistory.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: "Survey deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting survey:", error);
    return new Response(JSON.stringify({ error: "Failed to delete survey." }), { status: 500 });
  }
}
