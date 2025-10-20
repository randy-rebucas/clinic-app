import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/backup';
import { auditLogger, getClientIP, getUserAgent } from '@/lib/audit';

export async function POST(request: NextRequest, { params }: { params: Promise<{ backupId: string }> }) {
  try {
    const { backupId } = await params;
    const body = await request.json();
    const { collections, skipExisting, createdBy } = body;

    if (!createdBy) {
      return NextResponse.json({ error: 'createdBy is required' }, { status: 400 });
    }

    await backupService.restoreBackup(backupId, {
      collections,
      skipExisting,
      createdBy,
    });

    // Log backup restoration
    await auditLogger.logSystemAction(
      createdBy,
      'admin', // Assuming admin role for restore operations
      'restore',
      {
        backupId,
        collections: collections || 'all',
        skipExisting,
      },
      getClientIP(request),
      getUserAgent(request)
    );

    return NextResponse.json({ success: true, message: 'Backup restored successfully' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ backupId: string }> }) {
  try {
    const { backupId } = await params;
    const { createdBy } = await request.json();

    if (!createdBy) {
      return NextResponse.json({ error: 'createdBy is required' }, { status: 400 });
    }

    await backupService.deleteBackup(backupId);

    // Log backup deletion
    await auditLogger.logSystemAction(
      createdBy,
      'admin', // Assuming admin role for delete operations
      'backup',
      { backupId },
      getClientIP(request),
      getUserAgent(request)
    );

    return NextResponse.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
  }
}
