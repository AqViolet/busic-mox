import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import fs from "fs"
import path from "path"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const songId = params.id
    console.log("Deleting song ID:", songId)

    const [rows]: any = await db.execute("SELECT file_path FROM songs WHERE id = ?", [songId])
    if (!rows.length) {
      return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 })
    }

    const songPath = rows[0].file_path
    const fullPath = path.join(process.cwd(), "public", songPath)

    console.log("Deleting file:", fullPath)

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      console.log("✅ Deleted file:", fullPath)
    } else {
      console.log("⚠️ File not found:", fullPath)
    }

    await db.execute("DELETE FROM songs WHERE id = ?", [songId])
    console.log("✅ Deleted DB record for song ID:", songId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ Error deleting song:", err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}