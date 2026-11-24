import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getUserId, unauthorized } from '@/lib/auth';

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

// GET /api/projects/[id]/tasks - List tasks for a project with filter and sort
export async function GET(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();

    // Verify project ownership
    const project = await Project.findOne({ _id: params.id, user: userId });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    // Filter criteria
    const filter = { project: params.id, user: userId };
    if (status && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }

    // Sort criteria
    const sort = {};
    if (sortBy === 'dueDate') {
      sort.dueDate = order;
    } else {
      sort.createdAt = order;
    }

    const tasks = await Task.find(filter).sort(sort);

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/tasks - Create task under project
export async function POST(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();

    // Verify project ownership
    const project = await Project.findOne({ _id: params.id, user: userId });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, status, dueDate } = body || {};

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const taskStatus = status && VALID_STATUSES.includes(status) ? status : 'todo';

    const task = await Task.create({
      project: params.id,
      user: userId,
      title: title.trim(),
      description: (description || '').trim(),
      status: taskStatus,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
