export function getProjectDurationSeconds(project) {
    return project.shots.reduce((sum, shot) => sum + shot.durationSeconds, 0);
}
export function getShotById(project, shotId) {
    return project.shots.find((shot) => shot.id === shotId);
}
export function reorderShot(project, draggedShotId, targetShotId) {
    if (draggedShotId === targetShotId)
        return project;
    const from = project.shots.findIndex((shot) => shot.id === draggedShotId);
    const to = project.shots.findIndex((shot) => shot.id === targetShotId);
    if (from < 0 || to < 0)
        return project;
    const shots = [...project.shots];
    const [shot] = shots.splice(from, 1);
    const insertAt = from < to ? to - 1 : to;
    shots.splice(insertAt, 0, shot);
    return { ...project, shots };
}
