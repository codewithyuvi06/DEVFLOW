import { Router } from 'express';
import { archiveProject, createProject, getProject, listProjects, updateProject } from '../controllers/projectController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { projectSchema } from '../validators/schemas';
const router = Router(); router.use(requireAuth);
router.get('/', listProjects); router.post('/', validate(projectSchema), createProject);
router.get('/:projectId', getProject); router.patch('/:projectId', updateProject); router.delete('/:projectId', archiveProject);
export default router;
