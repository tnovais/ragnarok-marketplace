import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Save to public/uploads
    const filename = `${randomUUID()}${path.extname(file.name)}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    // Ensure directory exists (Node 10+ recursive mkdir)
    try {
        await writeFile(path.join(uploadDir, filename), buffer);
    } catch (error) {
        // Try creating directory if it fails
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        await writeFile(path.join(uploadDir, filename), buffer);
    }

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
}
