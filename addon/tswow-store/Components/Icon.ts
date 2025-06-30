export function createIcon(parentFrame: WoWAPI.Frame, texturePath: WoWAPI.TexturePath, point: { point: WoWAPI.Point; offsetX: number; offsetY: number }, size: { width: number; height: number }, layer?: WoWAPI.Layer) {
    const iconFrame = CreateFrame("Frame", "IconFrame" + texturePath, parentFrame);
    iconFrame.SetSize(size.width, size.height);
    iconFrame.SetPoint(point.point, point.offsetX, point.offsetY);

    iconFrame['texture'] = parentFrame.CreateTexture("iconTexture" + texturePath, layer || "BACKGROUND", null, -10);
    iconFrame['texture'].SetTexture(texturePath);
    iconFrame['texture'].SetPoint("CENTER", iconFrame, "CENTER")
    iconFrame['texture'].SetSize(iconFrame.GetWidth() + 3.2, iconFrame.GetHeight());

    return iconFrame;
}
