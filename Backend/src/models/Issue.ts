import { Schema, model } from 'mongoose';
const issueSchema = new Schema({
  number: { type: Number, required: true }, title: { type: String, required: true, trim: true, maxlength: 180 }, description: { type: String, default: '', maxlength: 10000 },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true }, team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  status: { type: String, enum: ['Todo', 'In progress', 'In review', 'Done'], default: 'Todo' },
  priority: { type: String, enum: ['Urgent', 'High', 'Medium', 'Low'], default: 'Medium' },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' }, reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date }, labels: [{ type: String, trim: true, maxlength: 30 }],
  comments: [{ author: { type: Schema.Types.ObjectId, ref: 'User', required: true }, body: { type: String, required: true, maxlength: 3000 }, createdAt: { type: Date, default: Date.now } }],
  closedAt: { type: Date }
}, { timestamps: true, versionKey: false });
issueSchema.index({ project: 1, number: 1 }, { unique: true });
export const Issue = model('Issue', issueSchema);
