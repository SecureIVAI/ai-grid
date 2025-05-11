import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    const { id, newPassword } = await req.json();

    // validate session
    if (!session?.user?.id || !session.user.name) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // change password in db here
        const user = await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        // create audit log entry
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: `${session.user.name} reset password for ${user.name}`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json({ error: "Password reset failed" }, { status: 500 });
    }
}
