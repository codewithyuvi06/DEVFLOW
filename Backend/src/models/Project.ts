import { Schema, model } from 'mongoose';
const projectSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 }, description: { type: String, default: '', maxlength: 1000 },
  color: { type: String, default: '#700B97', match: /^#[0-9a-fA-F]{6}$/ },
  status: { type: String, enum: ['On track', 'At risk', 'Planning'], default: 'Planning' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  repository: { type: Schema.Types.ObjectId, ref: 'Repository' },
  dueDate: { type: Date }, archivedAt: { type: Date }
}, { timestamps: true, versionKey: false });
projectSchema.index({ team: 1, name: 1 });
export const Project = model('Project', projectSchema);
