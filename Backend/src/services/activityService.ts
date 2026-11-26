import { Activity } from '../models/Activity';
export async function logActivity(input: { team: string; actor: string; type: 'project'|'issue'|'repository'|'pull_request'|'team'|'member'; action: string; target: string; targetId?: string; metadata?: Record<string, unknown> }) {
  return Activity.create({ ...input, targetId: input.targetId ?? '', metadata: input.metadata ?? {} });
}
