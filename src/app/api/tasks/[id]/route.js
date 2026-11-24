import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { getUserId, unauthorized } from '@/lib/auth';

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

// GET /api/tasks/[id] - Get single task
export async function GET(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();
    const task = await Task.findOne({ _id: params.id, user: userId });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();

    const body = await req.json();
    const { title, description, status, dueDate } = body || {};

    if (title !== undefined && !title.trim()) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Status must be one of: todo, in-progress, done' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await Task.findOneAndUpdate(
      { _id: params.id, user: userId },
      updateData,
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(req, { params }) {
  try {
    const userId = getUserId(req);
    if (!userId) return unauthorized();

    await connectDB();

    const task = await Task.findOneAndDelete({ _id: params.id, user: userId });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
