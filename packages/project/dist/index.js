export function getActiveBranch(project) {
    return project.branches.find((branch) => branch.id === project.activeBranchId) ?? project.branches[0];
}
export function getProjectDurationSeconds(project, branchId = project.activeBranchId) {
    return getBranchBlocks(project, branchId).reduce((sum, block) => sum + block.durationSeconds, 0);
}
export function getSceneBlockById(project, blockId, branchId = project.activeBranchId) {
    return getBranchBlocks(project, branchId).find((block) => block.id === blockId);
}
export function getShotById(project, shotId) {
    return getSceneBlockById(project, shotId);
}
export function reorderSceneBlock(project, draggedBlockId, targetBlockId, branchId = project.activeBranchId) {
    if (draggedBlockId === targetBlockId)
        return project;
    const activeBranch = getActiveBranchById(project, branchId);
    if (!activeBranch)
        return project;
    const from = activeBranch.blocks.findIndex((block) => block.id === draggedBlockId);
    const to = activeBranch.blocks.findIndex((block) => block.id === targetBlockId);
    if (from < 0 || to < 0)
        return project;
    const blocks = [...activeBranch.blocks];
    const [block] = blocks.splice(from, 1);
    const insertAt = from < to ? to - 1 : to;
    blocks.splice(insertAt, 0, block);
    return updateBranch(project, branchId, { blocks });
}
export function reorderShot(project, draggedShotId, targetShotId) {
    return reorderSceneBlock(project, draggedShotId, targetShotId);
}
export function duplicateBranch(project, branchId, nextBranchId, nextName) {
    const branch = getActiveBranchById(project, branchId);
    if (!branch)
        return project;
    const cloned = {
        ...branch,
        id: nextBranchId,
        name: nextName,
        status: "draft",
        forkedFromBranchId: branch.id,
        blocks: branch.blocks.map((block) => ({
            ...block,
            id: `${nextBranchId}-${block.id}`,
            status: block.status === "failed" ? "draft" : block.status,
            generationJobs: [],
        })),
    };
    return {
        ...project,
        activeBranchId: cloned.id,
        branches: [...project.branches, cloned],
    };
}
export function getClickThroughRate(snapshot) {
    return snapshot.views > 0 ? snapshot.clicks / snapshot.views : 0;
}
function getBranchBlocks(project, branchId) {
    const branch = getActiveBranchById(project, branchId);
    return branch?.blocks ?? project.shots ?? [];
}
function getActiveBranchById(project, branchId) {
    return project.branches.find((branch) => branch.id === branchId);
}
function updateBranch(project, branchId, patch) {
    return {
        ...project,
        branches: project.branches.map((branch) => (branch.id === branchId ? { ...branch, ...patch } : branch)),
    };
}
