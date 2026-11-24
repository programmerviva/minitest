import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getUserId, unauthorized } from '@/lib/auth';

// GET /api/projects/[id] - Get project details
export async function GET(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();
    const project = await Project.findOne({ _id: params.id, user: userId });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();

    const body = await req.json();
    const { title, description } = body || {};

    if (title !== undefined && !title.trim()) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();

    const project = await Project.findOneAndUpdate(
      { _id: params.id, user: userId },
      updateData,
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project and cascade delete tasks
export async function DELETE(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();

    const project = await Project.findOneAndDelete({ _id: params.id, user: userId });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Cascade delete associated tasks
    await Task.deleteMany({ project: params.id });

    return NextResponse.json(
      { message: 'Project and associated tasks deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
