import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/backup';
import { auditLogger, getClientIP, getUserAgent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collections, includeAuditLogs, description, createdBy } = body;

    if (!createdBy) {
      return NextResponse.json({ error: 'createdBy is required' }, { status: 400 });
    }

    const backupData = await backupService.createBackup({
      collections,
      includeAuditLogs,
      description,
      createdBy,
    });

    // Log backup creation
    await auditLogger.logSystemAction(
      createdBy,
      'admin', // Assuming admin role for backup operations
      'backup',
      {
        backupId: backupData.backupId,
        collections: collections || 'all',
        recordCount: backupData.metadata.totalRecords,
      },
      getClientIP(request),
      getUserAgent(request)
    );

    return NextResponse.json({
      success: true,
      backup: {
        backupId: backupData.backupId,
        timestamp: backupData.timestamp,
        totalRecords: backupData.metadata.totalRecords,
        backupSize: backupData.metadata.backupSize,
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const backups = await backupService.listBackups();
    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error listing backups:', error);
    return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
  }
}
