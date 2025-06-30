import { StoreItem } from "../../../shared/Payloads/StoreItemPayload";
import { updateItems } from "./Items";

let leftButton: WoWAPI.Button;
let rightButton: WoWAPI.Button;

export function createNavButtons(parent: WoWAPI.Frame) {
    leftButton = CreateFrame("Button", "leftNavButton", parent);
    leftButton.SetSize(parent.GetWidth() / 22, parent.GetHeight() / 20);
    leftButton.SetPoint("CENTER", 60, -260);

    let leftText = leftButton.CreateTexture();
    leftText.SetAllPoints();
    leftText.SetTexture("Interface\\AddOns\\dh-store-assets\\StoreFrame_Main.blp");
    leftText.SetTexCoord(0.84814453125, 0.87744140625, 0.84619140625, 0.87548828125);
    leftButton.Show();

    rightButton = CreateFrame("Button", "rightNavButton", parent);
    rightButton.SetSize(parent.GetWidth() / 22, parent.GetHeight() / 20);
    rightButton.SetPoint("CENTER", leftButton, 30, 0);

    let rightText = rightButton.CreateTexture();
    rightText.SetAllPoints();
    rightText.SetTexture("Interface\\AddOns\\dh-store-assets\\StoreFrame_Main.blp");
    rightText.SetTexCoord(0.93896484375, 0.96826171875, 0.84619140625, 0.87548828125);

    rightButton.Show();
}

export function updateNavButtonScripts(currentTab: number, currentPage: number, parentFrame: WoWAPI.Frame, storeItems: StoreItem[]) {
    leftButton.SetScript("OnClick", (f, button, down) => {
        if (currentPage == 0) return;
        currentPage--;
        updateItems(parentFrame, storeItems.slice(currentPage * 8, (currentPage * 8) + 8), currentTab, currentPage)
    });
    rightButton.SetScript("OnClick", (f, button, down) => {
        if (Math.ceil(storeItems.length / 6) <= currentPage + 1) {
            return;
        }
        currentPage++;
        updateItems(parentFrame, storeItems.slice(currentPage * 8, (currentPage * 8) + 8), currentTab, currentPage)
    });
}