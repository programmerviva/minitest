import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { getUserId, unauthorized } from '@/lib/auth';

// GET /api/projects - List projects for logged-in user
export async function GET(req) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();
    const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(req) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();

    const body = await req.json();
    const { title, description } = body || {};

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const project = await Project.create({
      user: userId,
      title: title.trim(),
      description: (description || '').trim(),
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
