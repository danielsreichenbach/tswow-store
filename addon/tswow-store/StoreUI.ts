import { createCategories, updateCategories } from "./Components/Categories";
import { createAllItems, updateItems } from "./Components/Items";
import { setupModelFrame } from "./Components/modelFrame";
import { createNavButtons, updateNavButtonScripts } from "./Components/NavButtons";
import { createIcon } from "./Components/Icon";
import { StoreItemPayload } from "../../shared/Payloads/StoreItemPayload";
import { ClientCallbackOperations, SimpleMessagePayload } from "../../shared/Messages";
import { DonationPointsPayload } from "../../shared/Payloads/DonationPointsPayload";
import { GameMenuButton } from "./Components/GameMenu";

let accountPoints = 0;
let storeData: StoreItemPayload = null;
let shopMainFrame = null;
let selectedCategory = -1;
let currentTab = 0;
let currentPage = 0;
let pointsFrameString = null;

export function shopFrameSetup() {
    shopMainFrame = CreateFrame("Frame", "ShopMainFrame", UIParent);
    UISpecialFrames.push(`ShopMainFrame`)
    shopMainFrame.SetSize(UIParent.GetWidth() / 1.6, UIParent.GetHeight() / 1.3);
    shopMainFrame.SetPoint("CENTER");
    shopMainFrame.SetScript("OnShow", (self, key) => {
        self.ClearAllPoints()
        self.SetPoint("CENTER")
        PlaySound(88);
    })

    shopMainFrame.SetScript("OnHide", (self, key) => { _G['shopModelFrame'].Hide(), PlaySound(88); })
    shopMainFrame.SetMovable(true);
    shopMainFrame.EnableMouse(true)
    shopMainFrame.RegisterForDrag("LeftButton");
    shopMainFrame.SetScript("OnDragStart", () => { shopMainFrame.StartMoving(); });
    shopMainFrame.SetScript("OnDragStop", () => { shopMainFrame.StopMovingOrSizing(); });

    let shopMainFrameTexture = shopMainFrame.CreateTexture();
    shopMainFrameTexture.SetAllPoints();
    shopMainFrameTexture.SetTexture("Interface\\AddOns\\dh-store-assets\\NewStoreMain.blp");
    shopMainFrameTexture.SetTexCoord(0, 0.789062500, 0, 0.539062500);
    shopMainFrameTexture.SetSize(shopMainFrame.GetWidth() * 1.8, shopMainFrame.GetHeight() * 1.3);

    pointsFrameString = shopMainFrame.CreateFontString(null, "OVERLAY", "GameFontNormal");
    pointsFrameString.SetFont("Fonts\\FRIZQT__.TTF", 13, "OUTLINE");
    pointsFrameString.SetText(`${accountPoints}`);

    let shopCoin = createIcon(shopMainFrame, "Interface\\AddOns\\dh-store-assets\\coin.blp", { point: "BOTTOMLEFT", offsetX: 75, offsetY: 28 }, { width: 12, height: 14 }, "OVERLAY");
    pointsFrameString.SetPoint("BOTTOMLEFT", shopCoin, 15, 0);

    setupModelFrame()
    createNavButtons(shopMainFrame);
    createAllItems(shopMainFrame)
    createCloseButton(shopMainFrame, { width: 30, height: 30 }, () => { shopMainFrame.Hide(); });
    GameMenuButton(shopMainFrame, "Store");
    createCategories(shopMainFrame)
    StoreCallbacks()
}

export function ShopFrameUpdate() {
    let catButtons = updateCategories(storeData.AllItems.map((collection) => collection.Items[0].Category))
    catButtons.forEach((catButton, i) => {
        catButton.catButton.SetScript("OnClick", (frame, button, down) => {
            if (selectedCategory !== -1) {
                let previousCatButton = catButtons[selectedCategory]
                previousCatButton.activeTexture.Hide()
            }

            selectedCategory = i;
            let currentCatButton = catButtons[selectedCategory]
            currentCatButton.activeTexture.Show()

            currentTab = i
            currentPage = 0
            updateItems(shopMainFrame, storeData.AllItems[currentTab].Items.slice(currentPage * 8, (currentPage * 8) + 8), currentTab, currentPage)

            _G['shopCreatureModelFrame'].Hide()
            _G['shopPlayerModelFrame'].Hide()
            _G['shopModelFrame'].Hide();
        });
    });
    updateItems(shopMainFrame, storeData.AllItems[currentTab].Items, currentTab, currentPage);
    updateNavButtonScripts(currentTab, currentPage, shopMainFrame, storeData.AllItems[currentTab].Items)
}

function StoreCallbacks() {
    OnCustomPacket(ClientCallbackOperations.RECEIVE_ITEMS, (pkt) => {
        const data = new StoreItemPayload();
        storeData = data.read(pkt);
        ShopFrameUpdate();
        _G['ShopMainFrame'].Hide()
    });

    OnCustomPacket(ClientCallbackOperations.GET_POINTS, (pkt) => {
        const data = new DonationPointsPayload();
        let returnData = data.read(pkt);
        accountPoints = returnData.points;
        pointsFrameString.SetText(`${accountPoints}`);
    });
    new SimpleMessagePayload(ClientCallbackOperations.REQUEST_ITEMS, "").write().Send();
    new SimpleMessagePayload(ClientCallbackOperations.REQUEST_POINTS, "").write().Send();
}